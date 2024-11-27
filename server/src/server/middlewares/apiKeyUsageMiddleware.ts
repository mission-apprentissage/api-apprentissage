import type { FastifyReply, FastifyRequest } from "fastify";
import type { IIndicateurUsageApi } from "shared/models/indicateurs/usage_api.model";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

async function updateIndicateur(request: FastifyRequest, reply: FastifyReply) {
  if (request.user && request.user.type === "user" && request.api_key) {
    // We group usage by day
    const now = new Date();
    now.setUTCMilliseconds(0);
    now.setUTCSeconds(0);
    now.setUTCMinutes(0);
    now.setUTCHours(0);

    const metadata: Omit<IIndicateurUsageApi, "_id" | "usage"> = {
      user_id: request.user.value._id,
      api_key_id: request.api_key._id,
      method: request.routeOptions.method,
      path: request.routeOptions.config.url,
      date: now,
    };

    await getDbCollection("indicateurs.usage_api").updateOne(
      metadata,
      { $setOnInsert: { ...metadata, usage: {} } },
      { upsert: true }
    );
    await getDbCollection("indicateurs.usage_api").updateOne(metadata, [
      {
        $set: {
          [`usage.${reply.statusCode}`]: { $add: [{ $ifNull: [`$usage.${reply.statusCode}`, 0] }, 1] },
        },
      },
    ]);
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
