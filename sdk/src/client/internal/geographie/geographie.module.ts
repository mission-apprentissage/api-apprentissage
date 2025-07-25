import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";

import { z } from "zod/v4-mini";
import type { ICommune, IDepartement, IMissionLocale } from "../../../models/index.js";
import { zCommune, zDepartement, zMissionLocale } from "../../../models/index.js";
import type { IApiGetRoutes, IApiQuery } from "../../../routes/index.js";
import type { ApiClient } from "../../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type GeographieModule = {
  rechercheCommune(querystring: IApiQuery<IApiGetRoutes["/geographie/v1/commune/search"]>): Promise<ICommune[]>;
  listDepartements(): Promise<IDepartement[]>;
  listMissionLocales(querystring: IApiQuery<IApiGetRoutes["/geographie/v1/mission-locale"]>): Promise<IMissionLocale[]>;
};

export function buildGeographieModule(apiClient: ApiClient): GeographieModule {
  const communeCache = new LRUCache<string, ICommune[]>({
    max: 500,
    ttl: 1_000 * 60 * 60,
  });

  return {
    rechercheCommune: async (
      querystring: IApiQuery<IApiGetRoutes["/geographie/v1/commune/search"]>
    ): Promise<ICommune[]> => {
      const cacheKey = stringify(querystring);
      const cached = communeCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await apiClient.get("/geographie/v1/commune/search", { querystring });

      const result = parseApiResponse(data, z.array(zCommune));
      communeCache.set(cacheKey, result);

      return result;
    },
    listDepartements: async (): Promise<IDepartement[]> => {
      const data = await apiClient.get("/geographie/v1/departement", {});

      return parseApiResponse(data, z.array(zDepartement));
    },
    listMissionLocales: async (
      querystring: IApiQuery<IApiGetRoutes["/geographie/v1/mission-locale"]> = {}
    ): Promise<IMissionLocale[]> => {
      const data = await apiClient.get("/geographie/v1/mission-locale", { querystring });
      return parseApiResponse(data, z.array(zMissionLocale));
    },
  };
}
