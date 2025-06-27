import { internal, isBoom } from "@hapi/boom";
import type { AxiosInstance } from "axios";
import { isAxiosError } from "axios";
import axiosRetry, { exponentialDelay } from "axios-retry";
import type { IInseeItem } from "shared";
import { zInseeItem } from "shared";
import { z } from "zod/v4-mini";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const rawClient = getApiClient(
  {
    baseURL: config.api.insee.endpoint,
    headers: {
      Authorization: `Bearer ${config.api.insee.token}`,
    },
    timeout: 60_000,
  },
  { cache: false }
);

axiosRetry(rawClient as AxiosInstance, {
  retries: 3,
  retryDelay: exponentialDelay,
});

const apiInsee = apiRateLimiter("insee", {
  nbRequests: 4000,
  durationInSeconds: 60,
  maxQueueSize: 10_000,
  timeout: 300_000,
  client: rawClient,
});

export async function fetchCollectivitesOutreMer(): Promise<IInseeItem[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get("/metadonnees/geo/collectivitesDOutreMer");

      return z.parseAsync(z.array(zInseeItem), data).catch((error) => {
        throw internal("api.insee: unable to parse collectivitesDOutreMer", { data, error });
      });
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCollectivitesOutreMer", { data: error.toJSON() });
      }

      throw withCause(internal("api.insee: unable to fetchCollectivitesOutreMer"), error);
    }
  });
}

export async function fetchCommuneOutreMer(codeCollectivite: string): Promise<IInseeItem[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/collectivitesDOutreMer/${codeCollectivite}/descendants`, {
        params: {
          type: "commune",
        },
      });

      return z.parseAsync(z.array(zInseeItem), data).catch((error) => {
        throw internal("api.insee: unable to parse communeOutreMer", { data, error });
      });
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCommuneOutreMer", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCommuneOutreMer"), error);
    }
  });
}

async function fetchArrondissements(): Promise<IInseeItem[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/arrondissementsMunicipaux`);

      return z.parseAsync(z.array(zInseeItem), data).catch((error) => {
        throw internal("api.insee: unable to parse arrondissement", { data, error });
      });
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchArrondissements", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchArrondissements"), error);
    }
  });
}

async function fetchArrondissementCodeCommune(codeArrondissement: string): Promise<string> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/arrondissementMunicipal/${codeArrondissement}/ascendants`, {
        params: { type: "Commune" },
      });

      const result = await z.parseAsync(z.array(z.object({ code: z.string() })), data).catch((error) => {
        throw internal("api.insee: unable to parse arrondissement ascendants", { data, error });
      });

      if (result.length !== 1) {
        throw internal("api.insee: unable to find commune code in arrondissement ascendants", { data, result });
      }

      return result[0].code;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchArrondissementCodeCommune", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchArrondissementCodeCommune"), error);
    }
  });
}

export async function fetchArrondissementIndexedByCodeCommune(): Promise<Record<string, IInseeItem[]>> {
  const arrondissements = await fetchArrondissements();

  const result: Record<string, IInseeItem[]> = {};

  for (const arrondissement of arrondissements) {
    const codeCommune = await fetchArrondissementCodeCommune(arrondissement.code);

    if (!result[codeCommune]) {
      result[codeCommune] = [];
    }
    result[codeCommune].push(arrondissement);
  }

  return result;
}

async function fetchCommuneDeleguees(): Promise<IInseeItem[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/communesDeleguees`);

      return z.parseAsync(z.array(zInseeItem), data).catch((error) => {
        throw internal("api.insee: unable to parse commune deleguees", { data, error });
      });
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCommuneDeleguees", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCommuneDeleguees"), error);
    }
  });
}

async function fetchCommuneDelegueeCodeCommune(code: string): Promise<string> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/communeDeleguee/${code}/ascendants`, {
        params: { type: "Commune" },
      });

      const result = await z.parseAsync(z.array(z.object({ code: z.string() })), data).catch((error) => {
        throw internal("api.insee: unable to parse deleguee ascendants", { data, error });
      });

      if (result.length !== 1) {
        throw internal("api.insee: unable to find commune code in deleguee ascendants", { data, result });
      }

      return result[0].code;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCommuneDelegueeCodeCommune", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCommuneDelegueeCodeCommune"), error);
    }
  });
}

async function fetchCommuneAssociees(): Promise<IInseeItem[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/communesAssociees`);

      return z.parseAsync(z.array(zInseeItem), data).catch((error) => {
        throw internal("api.insee: unable to parse communes associees", { data, error });
      });
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCommuneAssociees", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCommuneAssociees"), error);
    }
  });
}

async function fetchCommuneAssocieeCodeCommune(code: string): Promise<string> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/geo/communeAssociee/${code}/ascendants`, {
        params: { type: "Commune" },
      });

      const result = await z.parseAsync(z.array(z.object({ code: z.string() })), data).catch((error) => {
        throw internal("api.insee: unable to parse associee ascendants", { data, error });
      });

      if (result.length !== 1) {
        throw internal("api.insee: unable to find commune code in associee ascendants", { data, result });
      }

      return result[0].code;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCommuneAssocieeCodeCommune", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCommuneAssocieeCodeCommune"), error);
    }
  });
}

export async function fetchAnciennesCommuneByCodeCommune(): Promise<Record<string, IInseeItem[]>> {
  const [associees, deleguees] = await Promise.all([fetchCommuneAssociees(), fetchCommuneDeleguees()]);

  const result: Record<string, IInseeItem[]> = {};

  for (const associee of associees) {
    const codeCommune = await fetchCommuneAssocieeCodeCommune(associee.code);

    if (!result[codeCommune]) {
      result[codeCommune] = [];
    }
    result[codeCommune].push(associee);
  }

  for (const deleguee of deleguees) {
    const codeCommune = await fetchCommuneDelegueeCodeCommune(deleguee.code);

    if (!result[codeCommune]) {
      result[codeCommune] = [];
    }
    result[codeCommune].push(deleguee);
  }

  return result;
}
