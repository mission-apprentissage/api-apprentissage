import { gatewayTimeout, internal, isBoom } from "@hapi/boom"
import { captureException } from "@sentry/node"
import { createApiAlternanceToken, ORGANISATION_HABILITATIONS } from "api-alternance-sdk"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { HttpHeader } from "fastify/types/utils.js"
import type { IOrganisationInternal } from "shared/models/organisation.model"
import type { IApiKeyEnv, IUser } from "shared/models/user.model"

import config from "@/config.js"
import { withCause } from "@/services/errors/withCause.js"
import logger from "@/services/logger.js"
import { sleep } from "@/utils/asyncUtils.js"

type ForwardApiRequestConfig = {
  path: string
  querystring?: string
  requestInit: RequestInit
  timeoutMs?: number
}

type Identity = { user: IUser; organisation: IOrganisationInternal | null; apiKeyEnv: IApiKeyEnv }

// Point unique de dérivation de l'identity de forward : toutes les routes forwardées sont en
// auth "api-key", une api_key absente est un invariant cassé — on refuse plutôt que de retomber
// silencieusement sur la production. Le fallback "production" ne couvre que les clés antérieures
// à la migration 20260825120000-api-key-env (dump restauré) : elles gardent leur comportement historique.
export function buildForwardIdentity(user: IUser, request: Pick<FastifyRequest, "organisation" | "api_key">): Identity {
  if (!request.api_key) {
    throw internal("forwardApi.buildForwardIdentity: api_key absente sur une route forwardée")
  }

  return { user, organisation: request.organisation ?? null, apiKeyEnv: request.api_key.env ?? "production" }
}

function getLbaEndpoint(apiKeyEnv: IApiKeyEnv): string {
  return apiKeyEnv === "sandbox" ? config.api.lba.endpoint_sandbox : config.api.lba.endpoint
}

// Vérification observable de la config sandbox au démarrage du serveur et du job processor.
// Les entrées SOPS sont créées en placeholder tant que la procédure manuelle de fin de chantier
// n'a pas été exécutée : .required() est satisfait mais tout forward sandbox tomberait en 500.
// On signale sans bloquer le boot (la partie production du service reste saine).
export function checkForwardSandboxConfig(): void {
  const { private_key, private_key_sandbox } = config.api.alternance
  const { endpoint, endpoint_sandbox } = config.api.lba

  if (!private_key_sandbox.includes("PRIVATE KEY")) {
    const error = internal("forwardApi.checkForwardSandboxConfig: API_TOKEN_PRIVATE_KEY_SANDBOX n'est pas une clé PEM (placeholder non remplacé ?)")
    logger.error(error)
    captureException(error)
  }

  // En production uniquement : recette et local utilisent volontairement les mêmes valeurs
  // pour sandbox et non-sandbox
  if (config.env === "production" && (private_key_sandbox === private_key || endpoint_sandbox === endpoint)) {
    const error = internal("forwardApi.checkForwardSandboxConfig: la config sandbox est identique à la config production — l'isolation des clés sandbox est rompue")
    logger.error(error)
    captureException(error)
  }
}

function hasHabilitation(organisation: IOrganisationInternal | null, habilitation: IOrganisationInternal["habilitations"][number]): boolean {
  return organisation != null && organisation.habilitations.includes(habilitation)
}

export async function createAuthToken({ user, organisation, apiKeyEnv }: Identity, expiresIn: string | null = null): Promise<string> {
  // Sandbox : le token porte les habilitations d'écriture (miroir de SandboxRole côté autorisation,
  // même source ORGANISATION_HABILITATIONS) et est signé avec la clé privée sandbox, destinée à
  // correspondre à la clé publique de LBA recette (appairage posé par la procédure manuelle du
  // vault — non vérifiable depuis ce repo ; l'isolation vis-à-vis de LBA production est testée
  // sur la paire de test dans job.route.test.ts).
  const isSandbox = apiKeyEnv === "sandbox"

  // LBA rejette tout token sans organisation (et l'utilise comme partner_label des offres) :
  // en sandbox, un utilisateur sans organisation reçoit un label synthétique traçable qui isole
  // ses données de test de celles des autres utilisateurs
  const organisationLabel = isSandbox ? (user.organisation ?? `sandbox:${user.email}`) : user.organisation

  const token = await createApiAlternanceToken({
    data: {
      email: user.email,
      organisation: organisationLabel,
      habilitations: Object.fromEntries(ORGANISATION_HABILITATIONS.map((habilitation) => [habilitation, isSandbox || hasHabilitation(organisation, habilitation)])),
      // Défense en profondeur : l'isolation est portée par les clés de signature, ce claim permet
      // en plus au vérificateur de rejeter explicitement un token sandbox
      env: apiKeyEnv,
    },
    privateKey: isSandbox ? config.api.alternance.private_key_sandbox : config.api.alternance.private_key,
    expiresIn,
  })

  return `Bearer ${token}`
}

const IDEMPOTENT_METHODS: ReadonlySet<string> = new Set(["GET", "HEAD", "OPTIONS"])

// Erreurs de niveau connexion : la requête n'a pas atteint l'application distante, la rejouer est
// sans effet de bord tant que la méthode est idempotente.
const RETRIABLE_CONNECTION_ERROR_CODES: ReadonlySet<string> = new Set(["ECONNREFUSED", "ECONNRESET", "UND_ERR_SOCKET"])

const CONNECT_RETRY_DELAY_MS = 1_000

// `fetch` enveloppe la cause réelle dans un `TypeError: fetch failed` sans code : le code utile
// (ECONNREFUSED, ENOTFOUND...) est porté par `cause`.
function getErrorCode(error: unknown): string | null {
  const cause = error instanceof Error ? (error as { cause?: unknown }).cause : null
  const code = (cause as { code?: unknown } | null)?.code

  return typeof code === "string" ? code : null
}

function isRetriableConnectionError(error: unknown, requestInit: RequestInit): boolean {
  if (!IDEMPOTENT_METHODS.has((requestInit.method ?? "GET").toUpperCase())) {
    return false
  }

  // Budget déjà épuisé : rejouer est inutile, et laisser remonter le refus plutôt que l'abandon
  // du `sleep` garde la cause réelle dans l'erreur au lieu d'un 504 « timeout » trompeur.
  if (requestInit.signal?.aborted) {
    return false
  }

  const code = getErrorCode(error)

  return code !== null && RETRIABLE_CONNECTION_ERROR_CODES.has(code)
}

// Le reverse proxy de LBA est recréé lors de ses déploiements : le port reste non lié le temps du
// redémarrage et toute connexion entrante est refusée (labonnealternance#5334). Un rechargement de
// configuration dure moins d'une seconde et est absorbé par ce rejeu ; une recréation complète de
// conteneur dure plusieurs secondes et ressortira en 504, c'est attendu.
async function fetchWithConnectRetry(url: string, requestInit: RequestInit): Promise<Response> {
  try {
    return await fetch(url, requestInit)
  } catch (error) {
    if (!isRetriableConnectionError(error, requestInit)) {
      throw error
    }

    logger.warn({ url, err: error, code: getErrorCode(error) }, "forwardApi.getResponse: connexion refusée, nouvelle tentative")

    await sleep(CONNECT_RETRY_DELAY_MS, requestInit.signal ?? undefined)

    return fetch(url, requestInit)
  }
}

async function getResponse(request: ForwardApiRequestConfig, identity: Identity): Promise<Response> {
  const timeoutMs = request.timeoutMs ?? 10_000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  // L'endpoint LBA (production ou recette) est dérivé de l'environnement de la clé API.
  // url et apiKeyEnv sont inclus dans chaque contexte d'erreur : avec deux upstreams, un incident
  // production doit être distinguable d'un problème d'environnement sandbox.
  const url = getLbaEndpoint(identity.apiKeyEnv) + request.path + (request.querystring ?? "")
  const errorContext = { request, url, apiKeyEnv: identity.apiKeyEnv }

  try {
    // requestInit est un RequestInit, jamais un Headers : le constructeur accepte tout HeadersInit (ou undefined)
    const headers = new Headers(request.requestInit.headers)

    headers.append("Authorization", await createAuthToken(identity))

    const response = await fetchWithConnectRetry(url, { ...request.requestInit, headers, signal: controller.signal })

    if (response.status === 401) {
      throw internal("forwardApi.getResponse: unauthorized", {
        headers: response.headers,
        data: await response.text(),
        ...errorContext,
      })
    }

    return response
  } catch (error) {
    // Les Boom levés dans le try (401 upstream) doivent ressortir tels quels, pas ré-emballés
    // en "unexpected error" — le 401 est le symptôme attendu d'un mauvais appairage de clés
    if (isBoom(error)) {
      throw error
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw gatewayTimeout("forwardApi.getResponse: timeout", { ...errorContext, timeoutMs })
    }
    // Le code est repris dans le message : sans lui, Sentry regroupe sous une même issue un
    // refus de connexion, une erreur TLS et un échec DNS.
    const code = getErrorCode(error)

    throw withCause(internal(`forwardApi.getResponse: unexpected error${code === null ? "" : ` (${code})`}`, { ...errorContext, code }), error)
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function forwardApiRequest(request: ForwardApiRequestConfig, reply: FastifyReply, identity: Identity): Promise<FastifyReply> {
  const response = await getResponse(request, identity)

  // We cannot pass directly the headers to the reply.headers
  // Indeed response headers includes conflictual headers like content-enconding
  const responseHeaders: Partial<Record<HttpHeader, string>> = {}

  if (response.headers.has("content-type")) {
    responseHeaders["content-type"] = response.headers.get("content-type")!
  }

  return reply.status(response.status).headers(responseHeaders).send(response.body)
}
