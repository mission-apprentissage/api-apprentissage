import { internal } from "@hapi/boom";
import type { IGeoJsonPoint } from "api-alternance-sdk";
import type { AxiosError, AxiosInstance } from "axios";
import { isAxiosError } from "axios";
import axiosRetry, { exponentialDelay, isNetworkOrIdempotentRequestError } from "axios-retry";
import { zSourceAdresseResponse } from "shared";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const ONE_DAY = 24 * 60 * 60_000;
const ONE_YEAR = 365 * ONE_DAY;

const rawClient = getApiClient(
  {
    baseURL: config.api.adresse.endpoint,
    timeout: 60_000,
  },
  { cache: false }
);
const SAFE_HTTP_METHODS: Array<string | undefined> = ["get", "head", "options"];

axiosRetry(rawClient as AxiosInstance, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error: AxiosError) => {
    if (isNetworkOrIdempotentRequestError(error)) {
      return true;
    }

    if (!SAFE_HTTP_METHODS.includes(error.config?.method)) {
      return false;
    }

    return error.response?.status === 409 || error.response?.status === 500;
  },
});

const adresseClient = apiRateLimiter("geo", {
  nbRequests: 100,
  durationInSeconds: 60,
  client: rawClient,
  maxQueueSize: 10_000,
  timeout: 60_000,
});

type SearchAdresseQuery = {
  codePostal: string | null;
  codeInsee: string;
  adresse: string;
};

export const searchAdresseGeopoint = async (query: SearchAdresseQuery): Promise<IGeoJsonPoint | null> => {
  const cached = await getDbCollection("cache.adresse").findOne({
    "identifiant.codePostal": query.codePostal,
    "identifiant.codeInsee": query.codeInsee,
    "identifiant.adresse": query.adresse,
  });

  if (cached) {
    return cached.data;
  }

  const result = await adresseClient(async (client) => {
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
      return feature?.geometry ?? null;
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.adresse: unable to searchAdresseGeopoint", { data: error.toJSON() });
      }
      throw withCause(internal("api.adresse: unable to searchAdresseGeopoint"), error);
    }
  });

  await getDbCollection("cache.adresse").updateOne(
    {
      "identifiant.codePostal": query.codePostal,
      "identifiant.codeInsee": query.codeInsee,
      "identifiant.adresse": query.adresse,
    },
    { $set: { data: result, ttl: new Date(Date.now() + ONE_YEAR) } },
    { upsert: true }
  );

  return result;
};
