import { internal } from "@hapi/boom"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import type { ISecuredRouteSchema } from "api-alternance-sdk"
import { z } from "zod/v4-mini"

import config from "@/config.js"
import type { Server } from "@/server/server.js"
import { buildForwardIdentity } from "@/services/forward/forwardApi.service.js"
import { createMcpServer } from "@/services/mcp/mcp.server.js"

export const MCP_PATH = "/api/mcp"

export const MCP_RATE_LIMIT = { max: 60, timeWindow: "1 minute" } as const

// Le corps est du JSON-RPC validé par le SDK MCP : ce schéma ne sert qu'à l'authentification.
const mcpSecuritySchema: ISecuredRouteSchema = {
  method: "post",
  path: "/mcp",
  response: { "200": z.unknown() },
  securityScheme: { auth: "api-key", access: null, ressources: {} },
}

export const mcpRoutes = ({ server }: { server: Server }) => {
  const routeOptions = {
    onRequest: [server.auth(mcpSecuritySchema)],
    config: { rateLimit: MCP_RATE_LIMIT },
  }

  // Transport stateless : un serveur MCP et un transport par requête, aucune session conservée,
  // ce qui laisse n'importe quelle réplique répondre à n'importe quelle requête.
  server.post(MCP_PATH, routeOptions, async (request, reply) => {
    if (!request.user || request.user.type !== "user" || !request.api_key) {
      throw internal("mcp.routes: route MCP atteinte sans clé d'API")
    }

    // Un lot JSON-RPC exécuterait plusieurs appels d'outil pour une seule requête comptée par le quota.
    if (Array.isArray(request.body)) {
      return reply.status(400).send({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Les requêtes JSON-RPC groupées ne sont pas acceptées : envoyer un message par requête." },
        id: null,
      })
    }

    const { server: mcpServer, recordRejectedCall } = createMcpServer({
      identity: buildForwardIdentity(request.user.value, request),
      apiKeyId: request.api_key._id,
      userAgent: request.headers["user-agent"] ?? null,
    })
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })

    const headers = new Headers()
    for (const [name, value] of Object.entries(request.headers)) {
      // La clé d'API a été vérifiée par le middleware : elle n'est pas transmise au SDK.
      if (value === undefined || name === "authorization" || name === "content-length") continue
      headers.set(name, Array.isArray(value) ? value.join(", ") : value)
    }

    try {
      await mcpServer.connect(transport)
      const response = await transport.handleRequest(new Request(new URL(request.url, config.apiPublicUrl), { method: "POST", headers }), { parsedBody: request.body })

      // 200 : le transport a transmis une requête au serveur MCP (une notification reçoit 202, un refus du transport 4xx).
      const message = request.body as { method?: unknown; params?: { name?: unknown } } | null
      if (response.status === 200 && typeof message === "object" && message?.method === "tools/call") {
        await recordRejectedCall(message.params?.name)
      }

      reply.status(response.status)
      response.headers.forEach((value, name) => {
        reply.header(name, value)
      })
      return await reply.send(await response.text())
    } finally {
      await mcpServer.close()
    }
  })

  // GET (flux serveur) et DELETE (fin de session) n'ont pas de sens sans session.
  const methodNotAllowed = { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }
  server.get(MCP_PATH, routeOptions, async (_request, reply) => reply.status(405).header("allow", "POST").send(methodNotAllowed))
  server.delete(MCP_PATH, routeOptions, async (_request, reply) => reply.status(405).header("allow", "POST").send(methodNotAllowed))
}
