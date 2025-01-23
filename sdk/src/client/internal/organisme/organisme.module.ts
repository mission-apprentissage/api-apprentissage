import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";

import type { IOrganisme } from "../../../models/index.js";
import type { IApiGetRoutes, IApiQuery, IRechercheOrganismeResponse } from "../../../routes/index.js";
import { zApiOrganismesRoutes, zRechercheOrganismeResponse } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";
export type OrganismeModule = {
  recherche(querystring: IApiQuery<IApiGetRoutes["/organisme/v1/recherche"]>): Promise<IRechercheOrganismeResponse>;
  export(
    querystring: Omit<IApiQuery<IApiGetRoutes["/organisme/v1/export"]>, "page_index">
  ): AsyncGenerator<IOrganisme[], void, void>;
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
    export: async function* (
      querystring: Omit<IApiQuery<IApiGetRoutes["/organisme/v1/export"]>, "page_index">
    ): AsyncGenerator<IOrganisme[], void, void> {
      const {
        data: firstPageData,
        pagination: { page_count },
      } = parseApiResponse(
        await apiClient.get("/organisme/v1/export", { querystring: { ...querystring, page_index: 0 } }),
        zApiOrganismesRoutes.get["/organisme/v1/export"].response["200"]
      );

      yield firstPageData;

      for (let i = 1; i < page_count; i++) {
        const { data } = parseApiResponse(
          await apiClient.get("/organisme/v1/export", { querystring: { ...querystring, page_index: i } }),
          zApiOrganismesRoutes.get["/organisme/v1/export"].response["200"]
        );

        yield data;
      }
    },
  };
}
