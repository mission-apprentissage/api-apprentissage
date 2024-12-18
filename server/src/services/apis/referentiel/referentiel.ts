import { internal, isBoom } from "@hapi/boom";
import { isAxiosError } from "axios";
import { zOrganismeReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { z } from "zod";

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

const ITEMS_PAR_PAGES = 60_000;

export const fetchReferentielOrganismes = async () => {
  try {
    const { data } = await referentielClient.get("/organismes.json", {
      params: {
        items_par_page: ITEMS_PAR_PAGES,
      },
    });

    const result = z
      .object({
        pagination: z.object({
          page: z.number(),
          resultats_par_page: z.number(),
          nombre_de_page: z.number(),
          total: z.number(),
        }),
        organismes: zOrganismeReferentiel.array(),
      })
      .parse(data);

    if (result.pagination.total > ITEMS_PAR_PAGES) {
      throw internal("api.referentiel: too many results", { data: result.pagination });
    }

    if (result.pagination.total !== result.organismes.length) {
      throw internal("api.referentiel: mismatch between total and results", { data: result.pagination });
    }

    return result.organismes;
  } catch (error) {
    if (isBoom(error)) {
      throw error;
    }

    if (isAxiosError(error)) {
      throw internal("api.referentiel: unable to fetchReferentielOrganismes", { data: error.toJSON() });
    }

    throw withCause(internal("api.referentiel: unable to fetchReferentielOrganismes"), error);
  }
};
