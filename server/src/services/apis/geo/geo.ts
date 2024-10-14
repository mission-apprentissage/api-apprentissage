import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";
import type { ISourceGeoCommune, ISourceGeoDepartement, ISourceGeoRegion } from "shared";
import { sourceGeoCommune, sourceGeoDepartement, sourceGeoRegion } from "shared";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const geoClient = apiRateLimiter("geo", {
  nbRequests: 10,
  durationInSeconds: 1,
  client: getApiClient(
    {
      baseURL: config.api.geo.endpoint,
    },
    { cache: false }
  ),
});

export const fetchGeoRegions = async (): Promise<ISourceGeoRegion[]> => {
  return geoClient(async (client) => {
    try {
      const { data } = await client.get("/regions");

      return sourceGeoRegion.array().parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.geo: unable to fetchGeoRegions", { data: error.toJSON() });
      }
      throw withCause(internal("api.geo: unable to fetchGeoRegions"), error);
    }
  });
};

export const fetchGeoDepartements = async (codeRegion: string): Promise<ISourceGeoDepartement[]> => {
  return geoClient(async (client) => {
    try {
      const { data } = await client.get(`/regions/${codeRegion}/departements`);

      return sourceGeoDepartement.array().parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.geo: unable to fetchGeoDepartements", { data: error.toJSON() });
      }
      throw withCause(internal("api.geo: unable to fetchGeoDepartements"), error);
    }
  });
};

export const fetchGeoCommunes = async (codeDepartement: string): Promise<ISourceGeoCommune[]> => {
  return geoClient(async (client) => {
    try {
      const { data } = await client.get(`/departements/${codeDepartement}/communes`, {
        params: {
          fields: "code,codesPostaux,centre,bbox,codeDepartement,codeRegion",
          geometry: "centre",
        },
      });

      return sourceGeoCommune.array().parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.geo: unable to fetchGeoCommunes", { data: error.toJSON() });
      }
      throw withCause(internal("api.geo: unable to fetchGeoCommunes"), error);
    }
  });
};
