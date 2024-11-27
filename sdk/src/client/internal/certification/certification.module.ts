import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";
import { z } from "zod";

import type { ICertification } from "../../../models/index.js";
import { zCertification } from "../../../models/index.js";
import type { IApiGetRoutes, IApiQuery } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

type FindFilter = { identifiant?: { cfd?: string | null; rncp?: string | null } };

export type CertificationModule = {
  index(filter: FindFilter): Promise<ICertification[]>;
};

export function buildCertificationModule(apiClient: ApiClient): CertificationModule {
  const certificationCache = new LRUCache<string, ICertification[]>({
    max: 500,
    ttl: 1_000 * 60 * 60,
  });

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

      const cacheKey = stringify(querystring);
      const cached = certificationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await apiClient.get("/certification/v1", { querystring });

      const result = parseApiResponse(data, z.array(zCertification));
      certificationCache.set(cacheKey, result);
      return result;
    },
  };
}
