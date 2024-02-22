import { internal } from "@hapi/boom";
import { AxiosInstance, isAxiosError } from "axios";
import axiosRetry from "axios-retry";

import logger from "@/common/logger";
import config from "@/config";

import { withCause } from "../../errors/withCause";
import { apiRateLimiter } from "../../utils/apiUtils";
import getApiClient from "../client";

type ApiEntEtablissement = {
  siret: string;
  etat_administratif: string;
  enseigne: string;
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

// Cf Documentation : https://entreprise.api.gouv.fr/
// Migration V2 - V3 cf: https://entreprise.api.gouv.fr/files/correspondance_champs_v2_etablissements.pdf
const entrepriseClient = apiRateLimiter("entreprise", {
  nbRequests: 2,
  durationInSeconds: 1,
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

/**
 * Cf swagger : https://entreprise.api.gouv.fr/developpeurs/openapi#tag/Informations-generales/paths/~1v3~1insee~1sirene~1etablissements~1%7Bsiret%7D/get
 * @param {string} siret
 * @returns
 */
export async function getEtablissementDiffusible(siret: string): Promise<ApiEntEtablissement> {
  return entrepriseClient(async (client: AxiosInstance) => {
    try {
      logger.debug(`Get etablissement diffusible...`);
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
