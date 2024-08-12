import {
  IApiGetRoutes,
  IApiQuery,
  IRechercheOrganismeResponse,
  zRechercheOrganismeResponse,
} from "../../routes/index.js";
import { ApiClient } from "../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type OrganismeModule = {
  recherche(querystring: IApiQuery<IApiGetRoutes["/organismes/v1/recherche"]>): Promise<IRechercheOrganismeResponse>;
};

export function buildOrganismeModule(apiClient: ApiClient): OrganismeModule {
  return {
    recherche: async (
      querystring: IApiQuery<IApiGetRoutes["/organismes/v1/recherche"]>
    ): Promise<IRechercheOrganismeResponse> => {
      const data = await apiClient.get("/organismes/v1/recherche", { querystring });

      return parseApiResponse(data, zRechercheOrganismeResponse);
    },
  };
}
