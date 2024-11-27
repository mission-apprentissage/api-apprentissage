import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";

import type { IApiGetRoutes, IApiQuery, IRechercheOrganismeResponse } from "../../../routes/index.js";
import { zRechercheOrganismeResponse } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";
export type OrganismeModule = {
  recherche(querystring: IApiQuery<IApiGetRoutes["/organisme/v1/recherche"]>): Promise<IRechercheOrganismeResponse>;
};

export function buildOrganismeModule(apiClient: ApiClient): OrganismeModule {
  const organismeCache = new LRUCache<string, IRechercheOrganismeResponse>({
    max: 500,
    ttl: 1_000 * 60 * 60,
  });

  return {
    recherche: async (
      querystring: IApiQuery<IApiGetRoutes["/organisme/v1/recherche"]>
    ): Promise<IRechercheOrganismeResponse> => {
      const cacheKey = stringify(querystring);
      const cached = organismeCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await apiClient.get("/organisme/v1/recherche", { querystring });

      const result = parseApiResponse(data, zRechercheOrganismeResponse);
      organismeCache.set(cacheKey, result);
      return result;
    },
  };
}
