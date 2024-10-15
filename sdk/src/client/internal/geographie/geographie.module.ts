import type { ICommune, IDepartement } from "../../../models/index.js";
import { zCommune, zDepartement } from "../../../models/index.js";
import type { IApiGetRoutes, IApiQuery } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type GeographieModule = {
  rechercheCommune(querystring: IApiQuery<IApiGetRoutes["/geographie/v1/commune/search"]>): Promise<ICommune[]>;
  listDepartements(): Promise<IDepartement[]>;
};

export function buildGeographieModule(apiClient: ApiClient): GeographieModule {
  return {
    rechercheCommune: async (
      querystring: IApiQuery<IApiGetRoutes["/geographie/v1/commune/search"]>
    ): Promise<ICommune[]> => {
      const data = await apiClient.get("/geographie/v1/commune/search", { querystring });

      return parseApiResponse(data, zCommune.array());
    },
    listDepartements: async (): Promise<IDepartement[]> => {
      const data = await apiClient.get("/geographie/v1/departement", {});

      return parseApiResponse(data, zDepartement.array());
    },
  };
}
