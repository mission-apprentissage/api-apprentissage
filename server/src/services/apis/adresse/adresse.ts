import { internal } from "@hapi/boom";
import type { IGeoJsonPoint } from "api-alternance-sdk";
import { isAxiosError } from "axios";
import { zSourceAdresseResponse } from "shared";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const adresseClient = apiRateLimiter("geo", {
  nbRequests: 40,
  durationInSeconds: 1,
  client: getApiClient(
    {
      baseURL: config.api.adresse.endpoint,
    },
    { cache: false }
  ),
});

type SearchAdresseQuery = {
  codePostal: string | null;
  codeInsee: string;
  adresse: string;
};

export const searchAdresseGeopoint = async (query: SearchAdresseQuery): Promise<IGeoJsonPoint> => {
  return adresseClient(async (client) => {
    try {
      const { data } = await client.get("/search", {
        params: {
          limit: 1,
          autocomplete: 0,
          postcode: query.codePostal,
          citycode: query.codeInsee,
          q: query.adresse.replaceAll(" ", "+"),
        },
      });

      const feature = zSourceAdresseResponse.parse(data).features[0];
      if (!feature) {
        throw internal("api.adresse: unable to searchAdresseGeopoint", { data });
      }
      return feature.geometry;
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.adresse: unable to searchAdresseGeopoint", { data: error.toJSON() });
      }
      throw withCause(internal("api.adresse: unable to searchAdresseGeopoint"), error);
    }
  });
};
