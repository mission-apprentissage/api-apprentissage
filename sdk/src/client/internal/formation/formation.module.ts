import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";

import type { IFormation } from "../../../models/index.js";
import type { IApiGetRoutes, IApiQuery, IFormationSearchApiResult } from "../../../routes/index.js";
import { zApiFormationRoutes, zFormationSearchApiResult } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type FormationModule = {
  recherche(querystring: IApiQuery<IApiGetRoutes["/formation/v1/search"]>): Promise<IFormationSearchApiResult>;
  export(): Promise<IFormation[]>;
};

export function buildFormationModule(apiClient: ApiClient): FormationModule {
  const cache = new LRUCache<string, IFormationSearchApiResult>({
    max: 500,
    ttl: 1_000 * 60 * 60,
  });

  return {
    recherche: async (
      querystring: IApiQuery<IApiGetRoutes["/formation/v1/search"]>
    ): Promise<IFormationSearchApiResult> => {
      const cacheKey = stringify(querystring);
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await apiClient.get("/formation/v1/search", { querystring });

      const result = parseApiResponse(data, zFormationSearchApiResult);
      cache.set(cacheKey, result);
      return result;
    },
    export: async (): Promise<IFormation[]> => {
      const data = await apiClient.get("/formation/v1/export", {});

      return parseApiResponse(data, zApiFormationRoutes.get["/formation/v1/export"].response["200"]);
    },
  };
}
