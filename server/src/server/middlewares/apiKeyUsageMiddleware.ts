import { IIndicateurUsageApi } from "shared/models/indicateurs/usage_api.model";

import { getDbCollection } from "../../services/mongodb/mongodbService";
import { Server } from "../server";

export function apiKeyUsageMiddleware(server: Server) {
  server.addHook("onSend", async (request, reply) => {
    if (request.user && request.user.type === "user" && request.api_key) {
      // We group usage by day
      const now = new Date();
      now.setUTCMilliseconds(0);
      now.setUTCSeconds(0);
      now.setUTCMinutes(0);
      now.setUTCHours(0);

      const metadata: Omit<IIndicateurUsageApi, "_id" | "count"> = {
        user_id: request.user.value._id,
        api_key_id: request.api_key._id,
        method: request.routeOptions.method,
        path: request.routeOptions.config.url,
        date: now,
        status_code: reply.statusCode,
      };

      await getDbCollection("indicateurs.usage_api").updateOne(
        metadata,
        { $setOnInsert: { ...metadata, count: 0 } },
        { upsert: true }
      );
      await getDbCollection("indicateurs.usage_api").updateOne(metadata, { $inc: { count: 1 } });
    }
  });
}
