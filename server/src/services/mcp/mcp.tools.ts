import { badGateway } from "@hapi/boom"
import type { IFormationSearchApiQuery } from "api-alternance-sdk"
import * as z from "zod/v4"
import { searchFormation } from "@/services/formation/formation.service.js"
import type { Identity } from "@/services/forward/forwardApi.service.js"
import { fetchLbaJson, getLbaSiteUrl } from "@/services/forward/forwardApi.service.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"
import type { IMcpFormation, IMcpOffreDetail, IMcpOffreResume } from "./mcp.mappers.js"
import {
  formationToMcp,
  jobOfferToDetail,
  jobOfferToResume,
  searchHitToFormation,
  searchHitToOffreResume,
  zLbaJobDetailResponse,
  zLbaJobSearchResponse,
  zLbaTextSearchResponse,
} from "./mcp.mappers.js"

// Erreur dont le message est destiné au modèle appelant : entrée invalide ou ressource introuvable.
export class McpToolError extends Error {}

export const MCP_PAGE_SIZE = 20

const zLieu = {
  code_commune: z
    .string()
    .regex(/^(\d{5}|2[AB]\d{3})$/)
    .optional()
    .describe("Code INSEE ou code postal de la commune autour de laquelle chercher (5 caractères). Alternative à latitude/longitude."),
  latitude: z.number().min(-90).max(90).optional().describe("Latitude du point de recherche. À fournir avec longitude."),
  longitude: z.number().min(-180).max(180).optional().describe("Longitude du point de recherche. À fournir avec latitude."),
  rayon_km: z.number().min(0).max(200).default(30).describe("Rayon de recherche en kilomètres autour du lieu."),
}

const zCommun = {
  q: z.string().trim().min(1).max(200).optional().describe("Recherche en texte libre : métier, intitulé, mot-clé. Ne pas combiner avec romes."),
  romes: z
    .array(z.string().regex(/^[A-Z]\d{4}$/))
    .min(1)
    .max(20)
    .optional()
    .describe("Codes ROME du métier recherché (ex. M1805). Ne pas combiner avec q."),
  niveau_diplome: z.enum(["3", "4", "5", "6", "7"]).optional().describe("Niveau européen du diplôme visé : 3 = CAP, 4 = bac, 5 = bac+2, 6 = bac+3/4, 7 = bac+5."),
  page: z.number().int().min(0).max(19).default(0).describe(`Numéro de page, à partir de 0. ${MCP_PAGE_SIZE} résultats par page.`),
}

export const zRechercherOffresInput = z.object({ ...zCommun, ...zLieu })
export const zDetailOffreInput = z.object({ id: z.string().min(1).max(100).describe("Identifiant de l'offre, tel que renvoyé par rechercher_offres.") })
export const zRechercherFormationsInput = z.object({
  ...zCommun,
  rncp: z
    .string()
    .regex(/^RNCP\d{3,6}$/)
    .optional()
    .describe("Code RNCP de la certification visée (ex. RNCP35185). Ne pas combiner avec q."),
  ...zLieu,
})

type IRechercherOffresInput = z.output<typeof zRechercherOffresInput>
type IDetailOffreInput = z.output<typeof zDetailOffreInput>
type IRechercherFormationsInput = z.output<typeof zRechercherFormationsInput>

// total vaut null quand la source ne renvoie pas le nombre de résultats (recherche de formations par ROME/RNCP).
export type IMcpPage<T> = { resultats: T[]; page: number; nombre_pages: number; total: number | null }

type Geo = { latitude: number; longitude: number } | null

async function resolveLieu(input: Pick<IRechercherOffresInput, "code_commune" | "latitude" | "longitude">): Promise<Geo> {
  const hasLatitude = input.latitude !== undefined
  const hasLongitude = input.longitude !== undefined

  if (hasLatitude !== hasLongitude) {
    throw new McpToolError("latitude et longitude doivent être fournies ensemble.")
  }
  if (input.code_commune !== undefined && hasLatitude) {
    throw new McpToolError("Fournir soit code_commune, soit latitude et longitude, pas les deux.")
  }
  if (input.latitude !== undefined && input.longitude !== undefined) {
    return { latitude: input.latitude, longitude: input.longitude }
  }
  if (input.code_commune === undefined) {
    return null
  }

  const code = input.code_commune
  // Même critère que GET /geographie/v1/commune/search
  const commune = await getDbCollection("commune").findOne({
    $or: [{ "code.insee": code }, { "code.postaux": code }, { "arrondissements.code": code }, { "anciennes.codeInsee": code }],
  })
  if (!commune) {
    throw new McpToolError(`Aucune commune trouvée pour le code ${code}. Fournir un code INSEE ou un code postal valide, ou latitude et longitude.`)
  }

  const [longitude, latitude] = commune.localisation.centre.coordinates
  return { latitude, longitude }
}

function toQuerystring(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  return `?${search.toString()}`
}

function parseLba<S extends z.ZodType>(schema: S, path: string, response: { status: number; data: unknown }): z.output<S> {
  if (response.status !== 200) {
    throw badGateway(`mcp.tools: réponse LBA inattendue sur ${path}`, { status: response.status, data: response.data })
  }
  const parsed = schema.safeParse(response.data)
  if (!parsed.success) {
    throw badGateway(`mcp.tools: réponse LBA non conforme sur ${path}`, { issues: z.treeifyError(parsed.error) })
  }
  return parsed.data
}

async function searchLbaText(mode: "emplois" | "formations", input: { q: string; niveau_diplome?: string; rayon_km: number; page: number }, geo: Geo, identity: Identity) {
  const path = "/v3/search"
  const querystring = toQuerystring({
    q: input.q,
    mode,
    latitude: geo?.latitude,
    longitude: geo?.longitude,
    radius: geo ? input.rayon_km : undefined,
    level: input.niveau_diplome,
    page: input.page,
    hitsPerPage: MCP_PAGE_SIZE,
  })

  return parseLba(zLbaTextSearchResponse, path, await fetchLbaJson({ path, querystring, requestInit: { method: "GET" } }, identity))
}

export async function rechercherOffres(input: IRechercherOffresInput, identity: Identity): Promise<IMcpPage<IMcpOffreResume>> {
  if (input.q !== undefined && input.romes !== undefined) {
    throw new McpToolError("Fournir soit q (texte libre), soit romes (codes ROME), pas les deux.")
  }
  const geo = await resolveLieu(input)

  if (input.q !== undefined) {
    const result = await searchLbaText("emplois", { ...input, q: input.q }, geo, identity)
    return { resultats: result.hits.map(searchHitToOffreResume), page: result.page, nombre_pages: result.nbPages, total: result.nbHits }
  }

  if (input.romes === undefined && geo === null) {
    throw new McpToolError("Préciser au moins un critère : q, romes, ou un lieu (code_commune ou latitude/longitude).")
  }

  const path = "/v3/jobs/search"
  const querystring = toQuerystring({
    romes: input.romes?.join(","),
    latitude: geo?.latitude,
    longitude: geo?.longitude,
    radius: geo ? input.rayon_km : undefined,
    target_diploma_level: input.niveau_diplome,
  })
  const { jobs } = parseLba(zLbaJobSearchResponse, path, await fetchLbaJson({ path, querystring, requestInit: { method: "GET" } }, identity))

  // /v3/jobs/search n'est pas paginée : la page est découpée ici.
  const start = input.page * MCP_PAGE_SIZE
  return {
    resultats: jobs.slice(start, start + MCP_PAGE_SIZE).map(jobOfferToResume),
    page: input.page,
    nombre_pages: Math.ceil(jobs.length / MCP_PAGE_SIZE),
    total: jobs.length,
  }
}

export async function detailOffre(input: IDetailOffreInput, identity: Identity): Promise<IMcpOffreDetail> {
  const path = `/v3/jobs/${encodeURIComponent(input.id)}`
  // multicast_only : LBA répond 404 pour une offre non diffusable aux partenaires.
  const response = await fetchLbaJson({ path, querystring: "?multicast_only=true", requestInit: { method: "GET" } }, identity)

  if (response.status === 404 || response.status === 400) {
    throw new McpToolError(`Offre introuvable pour l'identifiant ${input.id}.`)
  }

  return jobOfferToDetail(parseLba(zLbaJobDetailResponse, path, response))
}

export async function rechercherFormations(input: IRechercherFormationsInput, identity: Identity): Promise<IMcpPage<IMcpFormation>> {
  if (input.q !== undefined && (input.romes !== undefined || input.rncp !== undefined)) {
    throw new McpToolError("Fournir soit q (texte libre), soit romes / rncp, pas les deux.")
  }
  const geo = await resolveLieu(input)

  if (input.q !== undefined) {
    const result = await searchLbaText("formations", { ...input, q: input.q }, geo, identity)
    return { resultats: result.hits.map(searchHitToFormation), page: result.page, nombre_pages: result.nbPages, total: result.nbHits }
  }

  if (input.romes === undefined && input.rncp === undefined && geo === null) {
    throw new McpToolError("Préciser au moins un critère : q, romes, rncp, ou un lieu (code_commune ou latitude/longitude).")
  }

  const query: IFormationSearchApiQuery = {
    page_size: MCP_PAGE_SIZE,
    page_index: input.page,
    latitude: geo?.latitude,
    longitude: geo?.longitude,
    radius: input.rayon_km,
    target_diploma_level: input.niveau_diplome,
    romes: input.romes,
    rncp: input.rncp,
    include_archived: false,
  }
  const { data, pagination } = await searchFormation(query)
  const lbaSiteUrl = getLbaSiteUrl(identity)

  return {
    resultats: data.map((formation) => formationToMcp(formation, lbaSiteUrl)),
    page: pagination.page_index,
    nombre_pages: pagination.page_count,
    total: null,
  }
}
