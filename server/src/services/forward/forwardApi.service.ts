import { gatewayTimeout, internal } from "@hapi/boom"
import { createApiAlternanceToken } from "api-alternance-sdk"
import type { FastifyReply } from "fastify"
import type { HttpHeader } from "fastify/types/utils.js"
import type { IOrganisationInternal } from "shared/models/organisation.model"
import type { IApiKeyEnv, IUser } from "shared/models/user.model"

import config from "@/config.js"
import { withCause } from "@/services/errors/withCause.js"

type ForwardApiRequestConfig = {
  path: string
  querystring?: string
  requestInit: RequestInit
  timeoutMs?: number
}

type Identity = { user: IUser; organisation: IOrganisationInternal | null; apiKeyEnv: IApiKeyEnv }

function getLbaEndpoint(apiKeyEnv: IApiKeyEnv): string {
  return apiKeyEnv === "sandbox" ? config.api.lba.endpoint_sandbox : config.api.lba.endpoint
}

function hasHabilitation(organisation: IOrganisationInternal | null, habilitation: IOrganisationInternal["habilitations"][number]): boolean {
  return organisation != null && organisation.habilitations.includes(habilitation)
}

export async function createAuthToken({ user, organisation, apiKeyEnv }: Identity, expiresIn: string | null = null): Promise<string> {
  // Sandbox : habilitations d'écriture accordées d'office (self-service), et signature avec la clé
  // privée acceptée par LBA recette — le token est structurellement invérifiable par LBA production
  const isSandbox = apiKeyEnv === "sandbox"

  const token = await createApiAlternanceToken({
    data: {
      email: user.email,
      organisation: user.organisation,
      habilitations: {
        "jobs:write": isSandbox || hasHabilitation(organisation, "jobs:write"),
        "applications:write": isSandbox || hasHabilitation(organisation, "applications:write"),
        "appointments:write": isSandbox || hasHabilitation(organisation, "appointments:write"),
      },
    },
    privateKey: isSandbox ? config.api.alternance.private_key_sandbox : config.api.alternance.private_key,
    expiresIn,
  })

  return `Bearer ${token}`
}

async function getResponse(request: ForwardApiRequestConfig, identity: Identity): Promise<Response> {
  const timeoutMs = request.timeoutMs ?? 10_000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // L'endpoint LBA (production ou recette) est dérivé de l'environnement de la clé API
    const url = getLbaEndpoint(identity.apiKeyEnv) + request.path + (request.querystring ?? "")

    const headers = request.requestInit instanceof Headers ? request.requestInit : new Headers(request.requestInit.headers)

    headers.append("Authorization", await createAuthToken(identity))

    const response = await fetch(url, { ...request.requestInit, headers, signal: controller.signal })

    if (response.status === 401) {
      throw internal("forwardApi.getResponse: unauthorized", {
        headers: response.headers,
        data: await response.text(),
        request,
      })
    }

    return response
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw gatewayTimeout("forwardApi.getResponse: timeout", { request, timeoutMs })
    }
    throw withCause(internal("forwardApi.getResponse: unexpected error", { request }), error)
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
