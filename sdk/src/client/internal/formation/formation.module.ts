import type { IApiGetRoutes, IApiQuery, IFormationExternal } from "../../../routes/index.js";
import { zApiFormationRoutes } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type FormationModule = {
  recherche(
    querystring: Omit<IApiQuery<IApiGetRoutes["/formation/v1/search"]>, "page_index">
  ): AsyncGenerator<IFormationExternal[], void, void>;
};

export function buildFormationModule(apiClient: ApiClient): FormationModule {
  return {
    recherche: async function* (
      querystring: Omit<IApiQuery<IApiGetRoutes["/formation/v1/search"]>, "page_index">
    ): AsyncGenerator<IFormationExternal[], void, void> {
      const {
        data: firstPageData,
        pagination: { page_count },
      } = parseApiResponse(
        await apiClient.get("/formation/v1/search", { querystring: { ...querystring, page_index: 0 } }),
        zApiFormationRoutes.get["/formation/v1/search"].response["200"]
      );

      yield firstPageData;

      for (let i = 1; i < page_count; i++) {
        const { data } = parseApiResponse(
          await apiClient.get("/formation/v1/search", { querystring: { ...querystring, page_index: i } }),
          zApiFormationRoutes.get["/formation/v1/search"].response["200"]
        );

        yield data;
      }
    },
  };
}
