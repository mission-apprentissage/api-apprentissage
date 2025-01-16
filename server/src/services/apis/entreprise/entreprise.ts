import { internal, isBoom } from "@hapi/boom";
import type { AxiosError, AxiosInstance } from "axios";
import { isAxiosError } from "axios";
import type { AxiosCacheInstance } from "axios-cache-interceptor";
import axiosRetry, { exponentialDelay, isNetworkOrIdempotentRequestError } from "axios-retry";
import type { IApiEntEtablissement, IApiEntUniteLegale } from "shared/models/cache/cache.entreprise.model";
import { zApiEntEtablissement, zApiEntUniteLegale } from "shared/models/cache/cache.entreprise.model";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import logger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

// Cf Documentation : https://doc.entreprise.api.gouv.fr/#param-tres-obligatoires
const rawClient = getApiClient({ baseURL: config.api.entreprise.baseurl }, { cache: false });

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

    return error.response?.status === 409;
  },
});

const apiEntrepriseClient = apiRateLimiter("apiEntreprise", {
  nbRequests: 100,
  durationInSeconds: 60,
  maxQueueSize: 10_000,
  timeout: 60_000,
  client: rawClient,
});

const ONE_DAY = 24 * 60 * 60_000;
const ONE_WEEK = 7 * ONE_DAY;

const apiParams = {
  token: config.api.entreprise.key,
  context: config.api.entreprise.context,
  recipient: config.api.entreprise.defaultRecipient,
  object: config.api.entreprise.object,
};

async function saveEtablissementCache(siret: string, data: IApiEntEtablissement | null) {
  await getDbCollection("cache.entreprise").updateOne(
    { identifiant: siret, "data.type": "etablissement" },
    {
      $set: {
        ttl: data?.etat_administratif === "A" ? new Date(Date.now() + ONE_WEEK) : null,
        "data.etablissement": data,
      },
      $setOnInsert: {
        identifiant: siret,
        "data.type": "etablissement",
      },
    },
    { upsert: true }
  );
}

async function saveUniteLegaleCache(siren: string, data: IApiEntUniteLegale | null) {
  await getDbCollection("cache.entreprise").updateOne(
    { identifiant: siren, "data.type": "unite_legale" },
    {
      $set: {
        ttl: data?.etat_administratif === "A" ? new Date(Date.now() + ONE_WEEK) : null,
        "data.unite_legale": data,
      },
      $setOnInsert: {
        identifiant: siren,
        "data.type": "unite_legale",
      },
    },
    { upsert: true }
  );
}

export function getSirenFromSiret(siret: string): string {
  return siret.substring(0, 9);
}

// Le status diffusible a changé en 2022, et devenu partiellement diffusible
// Seuls les informations personnelles des personnes physiques et l'adresse des établissements ne sont pas diffusibles
// https://www.insee.fr/fr/information/6683782
function dropNonDiffusibleUniteLegaleData<T extends IApiEntUniteLegale | IApiEntEtablissement["unite_legale"] | null>(
  data: T
): T {
  if (data === null) {
    return data;
  }

  const result: IApiEntEtablissement["unite_legale"] = {
    siren: data.siren,
    type: data.type,
    personne_morale_attributs: {
      raison_sociale: data.personne_morale_attributs.raison_sociale,
      sigle: null,
    },
    personne_physique_attributs: {
      prenom_usuel: null,
      nom_usage: null,
    },
    etat_administratif: data.etat_administratif,
    date_creation: data.date_creation,
  };

  if ("date_cessation" in data) {
    const r: IApiEntUniteLegale = { ...result, date_cessation: data.date_cessation };
    return r as T;
  }

  return result as T;
}

function dropNonDiffusibleEtablissementData(data: IApiEntEtablissement | null): IApiEntEtablissement | null {
  if (data === null) {
    return data;
  }

  return {
    siret: data.siret,
    etat_administratif: data.etat_administratif,
    date_creation: data.date_creation,
    date_fermeture: data.date_fermeture,
    enseigne: data.enseigne,
    unite_legale: dropNonDiffusibleUniteLegaleData(data.unite_legale),
    adresse: {
      numero_voie: null,
      indice_repetition_voie: null,
      type_voie: null,
      libelle_voie: null,
      complement_adresse: null,
      code_commune: data.adresse.code_commune,
      code_postal: null,
      libelle_commune: data.adresse.libelle_commune,
      libelle_commune_etranger: data.adresse.libelle_commune_etranger,
      code_pays_etranger: data.adresse.code_pays_etranger,
      libelle_pays_etranger: data.adresse.libelle_pays_etranger,
    },
  };
}

async function getEtablissementDiffusionPartielle(siret: string): Promise<IApiEntEtablissement | null> {
  const rawResult = await apiEntrepriseClient(async (client: AxiosInstance | AxiosCacheInstance) => {
    try {
      const response = await client.get(`insee/sirene/etablissements/${siret}`, {
        params: apiParams,
      });

      if (!response?.data?.data) {
        throw internal("api.entreprise: No etablissement data received", {
          data: response.data,
          headers: response.headers,
          status: response.status,
        });
      }

      return response.data.data;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        if (error.status === 404 || error.status === 451) {
          return null;
        }

        throw internal("api.entreprise: unable to get etablissement partiellement diffusible", {
          data: error.toJSON(),
        });
      }

      throw withCause(internal("api.entreprise: unable to get etablissement partiellement diffusible"), error);
    }
  });

  const result = zApiEntEtablissement.nullable().safeParse(rawResult);

  if (!result.success) {
    throw internal("api.entreprise: unable to parse etablissement diffusible", { data: rawResult, result });
  }

  return dropNonDiffusibleEtablissementData(result.data);
}

async function getUniteLegaleDiffusionPartielle(siren: string): Promise<IApiEntUniteLegale | null> {
  const rawResult = await apiEntrepriseClient(async (client: AxiosInstance | AxiosCacheInstance) => {
    try {
      const response = await client.get(`insee/sirene/unites_legales/${siren}`, {
        params: apiParams,
      });

      if (!response?.data?.data) {
        throw internal("api.entreprise: No unites_legales data received", {
          data: response.data,
          headers: response.headers,
          status: response.status,
        });
      }

      return response.data.data;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        if (error.status === 404) {
          return {
            siren,
            type: "personne_morale",
            personne_morale_attributs: { raison_sociale: null, sigle: null },
            personne_physique_attributs: { prenom_usuel: null, nom_usage: null },
            etat_administratif: "C",
            date_creation: null,
            date_cessation: new Date("1990-01-01").getTime(),
          };
        }

        if (error.status === 451) {
          return null;
        }

        throw internal("api.entreprise: unable to get unites_legales partiellement diffusible", {
          data: error.toJSON(),
        });
      }

      throw withCause(internal("api.entreprise: unable to get unites_legales partiellement diffusible"), error);
    }
  });

  const result = zApiEntUniteLegale.nullable().safeParse(rawResult);

  if (!result.success) {
    throw internal("api.entreprise: unable to parse etablissement unites_legales", { data: rawResult, result });
  }

  return dropNonDiffusibleUniteLegaleData(result.data);
}

export async function getEtablissementDiffusible(siret: string): Promise<IApiEntEtablissement | null> {
  const cached = await getDbCollection("cache.entreprise").findOne({
    identifiant: siret,
    "data.type": "etablissement",
  });

  if (cached && cached.data.type === "etablissement") {
    return cached.data.etablissement;
  }

  const rawResult = await apiEntrepriseClient(async (client: AxiosInstance | AxiosCacheInstance) => {
    try {
      logger.debug(`[Entreprise API] Fetching etablissement diffusible ${siret}...`);

      const response = await client.get(`insee/sirene/etablissements/diffusibles/${siret}`, {
        params: apiParams,
      });
      logger.debug(`api.entreprise: Fetched etablissement ${siret}`);

      if (!response?.data?.data) {
        throw internal("api.entreprise: No etablissement data received", {
          data: response.data,
          headers: response.headers,
          status: response.status,
        });
      }

      return response.data.data;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        if (error.status === 404) {
          return getEtablissementDiffusionPartielle(siret);
        }

        if (error.status === 451 || error.status === 422) {
          return null;
        }

        throw internal("api.entreprise: unable to get etablissement diffusible", { data: error.toJSON() });
      }

      throw withCause(internal("api.entreprise: unable to get etablissement diffusible"), error);
    }
  });

  const result = zApiEntEtablissement.nullable().safeParse(rawResult);

  if (!result.success) {
    throw internal("api.entreprise: unable to parse etablissement diffusible", { data: rawResult, result });
  }

  await saveEtablissementCache(siret, result.data);

  return result.data;
}

export async function getUniteLegaleDiffusible(siren: string): Promise<IApiEntUniteLegale | null> {
  const cached = await getDbCollection("cache.entreprise").findOne({
    identifiant: siren,
    "data.type": "unite_legale",
  });

  if (cached && cached.data.type === "unite_legale") {
    return cached.data.unite_legale;
  }

  const rawResult = await apiEntrepriseClient(async (client: AxiosInstance | AxiosCacheInstance) => {
    try {
      logger.debug(`[Entreprise API] Fetching unite legale diffusible ${siren}...`);

      const response = await client.get(`insee/sirene/unites_legales/diffusibles/${siren}`, {
        params: apiParams,
      });
      logger.debug(`api.entreprise: Fetched unite legale ${siren}`);

      if (!response?.data?.data) {
        throw internal("api.entreprise: No unite legale data received", {
          data: response.data,
          headers: response.headers,
          status: response.status,
        });
      }

      return response.data.data;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        if (error.status === 404) {
          return getUniteLegaleDiffusionPartielle(siren);
        }

        // 451: Unavailable For Legal Reasons
        // 422: Unprocessable Entity (e.g. invalid SIREN)
        if (error.status === 451 || error.status === 422) {
          return null;
        }

        throw internal("api.entreprise: unable to get unite legale diffusible", { data: error.toJSON() });
      }
      throw withCause(internal("api.entreprise: unable to get unite legale diffusible"), error);
    }
  });

  const result = zApiEntUniteLegale.nullable().parse(rawResult);

  await saveUniteLegaleCache(siren, result);

  return result;
}
