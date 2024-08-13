import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";

import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import logger from "@/services/logger.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

interface Result {
  siren: string;
  siege: {
    liste_idcc: string[];
  };
}

interface RechercheEntrepriseResponse {
  results: Result[];
}

const apiRechercheEntrepriseClient = apiRateLimiter("apiRechercheEntreprise", {
  nbRequests: 2,
  durationInSeconds: 1,
  client: getApiClient({
    baseURL: "https://recherche-entreprises.api.gouv.fr",
    timeout: 5000,
  }),
});

export const searchRechercheEntreprise = (siret: string) => {
  return apiRechercheEntrepriseClient(async (client) => {
    try {
      logger.debug(`[Recherche Entreprises Api] Fetching Siret ${siret}...`);
      const response = await client.get<RechercheEntrepriseResponse>("/search", {
        params: {
          q: siret,
          include_admin: "slug,etablissements",
        },
      });

      return response.data.results[0];
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal(`api.rechercheEntreprise: unable to get entreprise`, { data: error.toJSON() });
      }
      throw withCause(internal(`api.rechercheEntreprise: unable to get entreprise`), error);
    }
  });
};

export const getUniteesLegalesRechercheEntreprise = (siren: string) => {
  return apiRechercheEntrepriseClient(async (client) => {
    try {
      logger.debug(`[Recherche Entreprises Api] Fetching Siren ${siren}...`);
      const response = await client.get<RechercheEntrepriseResponse>("/search", {
        params: {
          q: siren,
          include_admin: "slug,etablissements",
        },
      });

      if (!response.data.results.length) return null;

      const {
        siege,
        etablissements,
        nombre_etablissements,
        nombre_etablissements_ouverts,
        nom_complet,
        nom_raison_sociale,
        activite_principale,
      } = response.data.results[0];
      return {
        nom_complet,
        nom_raison_sociale,
        activite_principale,
        nombre_etablissements,
        nombre_etablissements_ouverts,
        siege,
        etablissements,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal(`api.rechercheEntreprise: unable to get entreprise`, { data: error.toJSON() });
      }
      throw withCause(internal(`api.rechercheEntreprise: unable to get entreprise`), error);
    }
  });
};
