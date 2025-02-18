import { ObjectId } from "mongodb";
import type { IIndicateurUsageApi } from "shared/models/indicateurs/usage_api.model";

import { getStatusCodeType } from "@/server/middlewares/apiKeyUsageMiddleware.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

type OldItem = Omit<IIndicateurUsageApi, "type" | "code" | "count"> & { usage: Record<string, number> };

export const up = async () => {
  const cursor = getDbCollection("indicateurs.usage_api").find<OldItem>({ usage: { $exists: true } });

  for await (const item of cursor) {
    for (const [codeString, count] of Object.entries(item.usage)) {
      const code = parseInt(codeString, 10);
      const type = getStatusCodeType(code);

      const newItem: IIndicateurUsageApi = {
        _id: new ObjectId(),
        method: item.method,
        path: item.path,
        date: item.date,
        user_id: item.user_id,
        api_key_id: item.api_key_id,
        count,
        code,
        type,
      };

      await getDbCollection("indicateurs.usage_api").insertOne(newItem, { bypassDocumentValidation: true });
    }

    await getDbCollection("indicateurs.usage_api").deleteOne({ _id: item._id });
  }
};

export const requireShutdown: boolean = true;
