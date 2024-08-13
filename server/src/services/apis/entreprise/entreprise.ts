import { internal } from "@hapi/boom";
import { AxiosInstance, isAxiosError } from "axios";
import axiosRetry from "axios-retry";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import logger from "@/services/logger.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

export type ApiEntEtablissement = {
  siret: string;
  etat_administratif: string;
  enseigne: string;
  date_fermeture?: string | null;
  activite_principale: {
    code: string;
  };
  unite_legale: {
    personne_morale_attributs: {
      raison_sociale: string;
    };
  };
  tranche_effectif_salarie_etablissement: {
    de: number;
  };
  adresse: {
    complement_adresse: string;
    numero_voie: string;
    type_voie: string;
    libelle_voie: string;
    code_postal: string;
    libelle_commune: string;
    code_commune: string;
    code_cedex: string;
    acheminement_postal: {
      l1: string;
      l2: string;
      l3: string;
      l4: string;
      l5: string;
      l6: string;
      l7: string;
    };
  };
};

// Cf Documentation : https://doc.entreprise.api.gouv.fr/#param-tres-obligatoires
const apiEntrepriseClient = apiRateLimiter("apiEntreprise", {
  nbRequests: 100,
  durationInSeconds: 60,
  client: getApiClient({
    baseURL: config.api.entreprise.baseurl,
  }),
});

const apiParams = {
  token: config.api.entreprise.key,
  context: config.api.entreprise.context,
  recipient: config.api.entreprise.defaultRecipient,
  object: config.api.entreprise.object,
};

export const getEntreprisePart = (endpoint: string) => {
  return apiEntrepriseClient(async (client) => {
    try {
      logger.debug(`[Entreprise API] Fetching entreprise part ${endpoint}...`);
      const response = await client.get(endpoint, {
        params: apiParams,
      });

      return response.data.data;
    } catch (error) {
      if (error.message === "timeout of 5000ms exceeded") {
        return null;
      }
      if (error.response.status === 404) {
        return null;
      }

      if (isAxiosError(error)) {
        throw internal(`api.entreprise: unable to get part entreprise ${endpoint}`, { data: error.toJSON() });
      }
      throw withCause(internal(`api.entreprise: unable to get part entreprise ${endpoint}`), error);
    }
  });
};

export const getEntreprise = async (siren: string) => {
  // fetch all parts in parallel
  const [entreprise, siege_social, numero_tva, extrait_kbis] = await Promise.all([
    getEntreprisePart(`insee/sirene/unites_legales/diffusibles/${siren}`),
    getEntreprisePart(`insee/sirene/unites_legales/${siren}/diffusibles/siege_social`),
    // not critical, so we catch errors
    getEntreprisePart(`european_commission/unites_legales/${siren}/numero_tva`).catch(() => null),
    getEntreprisePart(`infogreffe/rcs/unites_legales/${siren}/extrait_kbis`).catch(() => null),
  ]);

  return {
    ...entreprise,
    siege_social,
    numero_tva,
    extrait_kbis,
  };
};

export async function getEtablissementDiffusible(siret: string): Promise<ApiEntEtablissement> {
  return apiEntrepriseClient(async (client: AxiosInstance) => {
    try {
      logger.debug(`[Entreprise API] Fetching etablissement diffusible ${siret}...`);
      axiosRetry(client, { retries: 3 });
      const response = await client.get(`insee/sirene/etablissements/diffusibles/${siret}`, {
        params: apiParams,
      });
      logger.debug(`api.entreprise: Fetched etablissement ${siret}`);
      if (!response?.data?.data) {
        throw internal("api.entreprise: No etablissement data received");
      }
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.entreprise: unable to get etablissement diffusible", { data: error.toJSON() });
      }
      throw withCause(internal("api.entreprise: unable to get etablissement diffusible"), error);
    }
  });
}
