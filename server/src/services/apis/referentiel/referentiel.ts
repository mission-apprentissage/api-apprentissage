import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";
import type { ISourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";

// Cf Documentation : https://referentiel.apprentissage.onisep.fr/api/v1/doc/#/

const referentielClient = getApiClient(
  {
    baseURL: config.api.referentielOnisep.endpoint,
  },
  { cache: false }
);

export const fetchReferentielOrganismes = async () => {
  try {
    const {
      data: { organismes },
    } = await referentielClient.get<{ organismes: ISourceReferentiel[] }>("/organismes.json", {
      params: {
        items_par_page: 60000,
      },
    });

    return organismes;
  } catch (error) {
    if (isAxiosError(error)) {
      throw internal("api.referentiel: unable to fetchReferentielOrganismes", { data: error.toJSON() });
    }
    throw withCause(internal("api.referentiel: unable to fetchReferentielOrganismes"), error);
  }
};
