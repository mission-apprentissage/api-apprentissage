import { isBoom } from "@hapi/boom"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { captureException } from "@sentry/node"
import type { ObjectId } from "mongodb"
import type { IIndicateurUsageMcpStatus } from "shared/models/indicateurs/usage_mcp.model"

import config from "@/config.js"
import type { Identity } from "@/services/forward/forwardApi.service.js"
import logger from "@/services/logger.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"
import { detailOffre, McpToolError, rechercherFormations, rechercherOffres, zDetailOffreInput, zRechercherFormationsInput, zRechercherOffresInput } from "./mcp.tools.js"

export const MCP_SERVER_NAME = "api-apprentissage"

export type McpCaller = {
  identity: Identity
  apiKeyId: ObjectId
  userAgent: string | null
}

const CLIENT_MAX_LENGTH = 40

export const MCP_TOOL_NAMES = ["rechercher_offres", "detail_offre", "rechercher_formations"] as const
type McpToolName = (typeof MCP_TOOL_NAMES)[number]

const UNKNOWN_TOOL = "outil_inconnu"

// Le transport est sans session : le nom déclaré à l'initialisation n'est pas connu lors d'un appel
// d'outil, seul le User-Agent identifie le client. On en garde le produit, sans la version, réduit à
// [a-z0-9._-] : la valeur reste choisie par l'appelant, le quota borne le nombre de valeurs distinctes.
export function resolveClientName(userAgent: string | null): string {
  const product = (userAgent ?? "").trim().split(/[\s/]/)[0].toLowerCase()
  return product.replace(/[^a-z0-9._-]/g, "").slice(0, CLIENT_MAX_LENGTH) || "inconnu"
}

async function recordUsage(caller: McpCaller, tool: McpToolName | typeof UNKNOWN_TOOL, client: string, status: IIndicateurUsageMcpStatus): Promise<void> {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)

  try {
    await getDbCollection("indicateurs.usage_mcp").updateOne(
      { date, user_id: caller.identity.user._id, api_key_id: caller.apiKeyId, tool, client, status },
      { $inc: { count: 1 } },
      { upsert: true }
    )
  } catch (error) {
    // Le compteur ne doit pas faire échouer l'appel d'outil, mais sa panne doit rester visible.
    logger.error({ err: error, tool, client, status }, "mcp.recordUsage: échec de l'écriture du compteur d'usage")
    captureException(error)
  }
}

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const

const LIEN_FICHE = "Chaque résultat contient url_fiche, le lien vers sa fiche sur La bonne alternance : c'est sur cette page que le candidat postule ou prend contact."

export type McpServerHandle = {
  server: McpServer
  // À appeler après un tools/call auquel le transport a répondu : compte en erreur d'outil l'appel que
  // le SDK a rejeté avant l'outil (outil inconnu, arguments invalides), qui n'est pas passé par `run`.
  recordRejectedCall: (toolName: unknown) => Promise<void>
}

export function createMcpServer(caller: McpCaller): McpServerHandle {
  const server = new McpServer({ name: MCP_SERVER_NAME, title: "API Apprentissage — offres et formations en alternance", version: config.version })
  const client = resolveClientName(caller.userAgent)
  let handled = false

  const run = async <T>(tool: McpToolName, handler: () => Promise<T>): Promise<CallToolResult> => {
    handled = true

    try {
      const result = await handler()
      await recordUsage(caller, tool, client, "success")
      return { content: [{ type: "text", text: JSON.stringify(result) }] }
    } catch (error) {
      if (error instanceof McpToolError) {
        await recordUsage(caller, tool, client, "tool_error")
        return { content: [{ type: "text", text: error.message }], isError: true }
      }

      await recordUsage(caller, tool, client, "server_error")
      logger.error({ err: error, tool, client }, "mcp: échec d'un appel d'outil")
      if (!isBoom(error) || error.output.statusCode >= 500) {
        captureException(error)
      }
      return { content: [{ type: "text", text: "Le service est momentanément indisponible. Réessayer plus tard." }], isError: true }
    }
  }

  server.registerTool(
    "rechercher_offres",
    {
      title: "Rechercher des offres en alternance",
      description: `Recherche des offres d'emploi en alternance (apprentissage et professionnalisation) en France, par texte libre (q) ou par codes ROME (romes), autour d'un lieu facultatif. ${LIEN_FICHE}`,
      inputSchema: zRechercherOffresInput,
      annotations: READ_ONLY,
    },
    async (input) => run("rechercher_offres", () => rechercherOffres(input, caller.identity))
  )

  server.registerTool(
    "detail_offre",
    {
      title: "Détail d'une offre en alternance",
      description: `Renvoie le détail d'une offre à partir de son identifiant (champ id de rechercher_offres) : description complète, compétences, contrat. ${LIEN_FICHE}`,
      inputSchema: zDetailOffreInput,
      annotations: READ_ONLY,
    },
    async (input) => run("detail_offre", () => detailOffre(input, caller.identity))
  )

  server.registerTool(
    "rechercher_formations",
    {
      title: "Rechercher des formations en alternance",
      description: `Recherche des formations en alternance en France, par texte libre (q), par codes ROME (romes) ou par code RNCP (rncp), autour d'un lieu facultatif. ${LIEN_FICHE}`,
      inputSchema: zRechercherFormationsInput,
      annotations: READ_ONLY,
    },
    async (input) => run("rechercher_formations", () => rechercherFormations(input, caller.identity))
  )

  return {
    server,
    recordRejectedCall: async (toolName) => {
      if (handled) return
      // Le nom vient de l'appelant : hors des outils déclarés, il est ramené à une valeur unique.
      const tool = MCP_TOOL_NAMES.find((name) => name === toolName) ?? UNKNOWN_TOOL
      await recordUsage(caller, tool, client, "tool_error")
    },
  }
}
