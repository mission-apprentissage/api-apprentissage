import type { IApiGetRoutes, IApiQuery, IRechercheOrganismeResponse } from "../../routes/index.js";
import { zRechercheOrganismeResponse } from "../../routes/index.js";
import type { ApiClient } from "../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type OrganismeModule = {
  recherche(querystring: IApiQuery<IApiGetRoutes["/organisme/v1/recherche"]>): Promise<IRechercheOrganismeResponse>;
};

export function buildOrganismeModule(apiClient: ApiClient): OrganismeModule {
  return {
    recherche: async (
      querystring: IApiQuery<IApiGetRoutes["/organisme/v1/recherche"]>
    ): Promise<IRechercheOrganismeResponse> => {
      const data = await apiClient.get("/organisme/v1/recherche", { querystring });

      return parseApiResponse(data, zRechercheOrganismeResponse);
    },
  };
}
