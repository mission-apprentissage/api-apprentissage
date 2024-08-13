import { z } from "zod";

import { ICertification, zCertification } from "../../models/index.js";
import { IApiGetRoutes, IApiQuery } from "../../routes/index.js";
import { ApiClient } from "../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

type FindFilter = { identifiant?: { cfd?: string | null; rncp?: string | null } };

export type CertificationModule = {
  index(filter: FindFilter): Promise<ICertification[]>;
};

export function buildCertificationModule(apiClient: ApiClient): CertificationModule {
  return {
    index: async (filter: FindFilter): Promise<ICertification[]> => {
      const querystring: IApiQuery<IApiGetRoutes["/certification/v1"]> = {};

      if (filter.identifiant != null) {
        if ("cfd" in filter.identifiant) {
          querystring["identifiant.cfd"] = filter.identifiant.cfd ?? "null";
        }
        if ("rncp" in filter.identifiant) {
          querystring["identifiant.rncp"] = filter.identifiant.rncp ?? "null";
        }
      }

      const data = await apiClient.get("/certification/v1", { querystring });

      return parseApiResponse(data, z.array(zCertification));
    },
  };
}
