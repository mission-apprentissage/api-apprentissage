import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";
import type { ISourceGeoCommune, ISourceGeoDepartement, ISourceGeoRegion } from "shared";
import { sourceGeoCommune, sourceGeoDepartement, sourceGeoRegion } from "shared";

import { z } from "zod/v4-mini";
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
      timeout: 30_000,
    },
    { cache: false }
  ),
});

export const fetchGeoRegions = async (): Promise<ISourceGeoRegion[]> => {
  return geoClient(async (client) => {
    try {
      const { data } = await client.get("/regions");

      return z.parse(z.array(sourceGeoRegion), data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.geo: unable to fetchGeoRegions", { data: error.toJSON() });
      }
      throw withCause(internal("api.geo: unable to fetchGeoRegions"), error);
    }
  });
};

export const fetchGeoRegion = async (code: string): Promise<ISourceGeoRegion> => {
  return geoClient(async (client) => {
    try {
      const { data } = await client.get(`/regions/${code}`);

      return sourceGeoRegion.parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.geo: unable to fetchGeoRegion", { data: error.toJSON(), code });
      }
      throw withCause(internal("api.geo: unable to fetchGeoRegion"), error);
    }
  });
};

export const fetchGeoDepartements = async (codeRegion: string): Promise<ISourceGeoDepartement[]> => {
  return geoClient(async (client) => {
    try {
      const { data } = await client.get(`/regions/${codeRegion}/departements`);

      return z.parse(z.array(sourceGeoDepartement), data);
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

      return z.parse(z.array(sourceGeoCommune), data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.geo: unable to fetchGeoCommunes", { data: error.toJSON() });
      }
      throw withCause(internal("api.geo: unable to fetchGeoCommunes"), error);
    }
  });
};
