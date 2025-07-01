import type { FastifyReply, FastifyRequest } from "fastify";
import type { IIndicateurUsageApi } from "shared/models/indicateurs/usage_api.model";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export function getStatusCodeType(statusCode: number) {
  if (statusCode >= 100 && statusCode < 200) {
    return "informational";
  }
  if (statusCode >= 200 && statusCode < 300) {
    return "success";
  }
  if (statusCode >= 300 && statusCode < 400) {
    return "redirection";
  }
  if (statusCode >= 400 && statusCode < 500) {
    return "client_error";
  }
  if (statusCode >= 500 && statusCode < 600) {
    return "server_error";
  }
  return "unknown";
}

async function updateIndicateur(request: FastifyRequest, reply: FastifyReply) {
  if (request.user && request.user.type === "user" && request.api_key) {
    // We group usage by day
    const now = new Date();
    now.setUTCMilliseconds(0);
    now.setUTCSeconds(0);
    now.setUTCMinutes(0);
    now.setUTCHours(0);

    const metadata: Omit<IIndicateurUsageApi, "_id" | "count" | "type"> = {
      user_id: request.user.value._id,
      api_key_id: request.api_key._id,
      method: Array.isArray(request.routeOptions.method)
        ? request.routeOptions.method.join(",")
        : request.routeOptions.method,
      path: request.routeOptions.config.url,
      code: reply.statusCode,
      date: now,
    };

    await getDbCollection("indicateurs.usage_api").updateOne(
      metadata,
      { $setOnInsert: { ...metadata, type: getStatusCodeType(reply.statusCode), count: 0 } },
      { upsert: true }
    );
    await getDbCollection("indicateurs.usage_api").updateOne(metadata, [{ $set: { count: { $add: ["$count", 1] } } }], {
      upsert: true,
    });
  }
}

async function updateLastUsedAt(request: FastifyRequest) {
  if (request.user && request.user.type === "user" && request.api_key) {
    const now = new Date();
    now.setUTCMilliseconds(0);
    await getDbCollection("users").updateOne(
      { "api_keys._id": request.api_key._id },
      {
        $set: {
          "api_keys.$.last_used_at": now,
          // This is very important to keep the user updated_at value as it will be used to determine if the user is inactive
          // and should be removed after 2 years of inactivity.
          updated_at: now,
        },
      }
    );
  }
}

export function apiKeyUsageMiddleware(server: Server) {
  server.addHook("onResponse", async (request, reply) => {
    await Promise.all([updateIndicateur(request, reply), updateLastUsedAt(request)]);
  });
}
