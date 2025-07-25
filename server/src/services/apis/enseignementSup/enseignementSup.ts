import { internal } from "@hapi/boom";
import axios, { isAxiosError } from "axios";
import { z } from "zod/v4-mini";

import config from "@/config.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const apiEnseignementSup = apiRateLimiter("insee", {
  nbRequests: 25,
  durationInSeconds: 60,
  client: axios.create({
    baseURL: config.api.enseignementSup.endpoint,
    timeout: 300_000,
  }),
});

const zAcademieData = z.object({
  dep_code: z.string(),
  aca_nom: z.string(),
  aca_id: z.string(),
  aca_code: z.string(),
});

export type IEnseignementSupAcademieData = z.infer<typeof zAcademieData>;

function fixGuadeloupeAcademie(data: IEnseignementSupAcademieData[]): IEnseignementSupAcademieData[] {
  const guadeloupeAcademie = data.find((academie) => academie.dep_code === "971");

  if (!guadeloupeAcademie) {
    throw internal("api.enseignementSup: unable to find Guadeloupe academie");
  }

  return data.map((academie): IEnseignementSupAcademieData => {
    // Saint-Martin et Saint-Barthélemy sont rattachés à l'académie de Guadeloupe
    if (academie.dep_code === "977" || academie.dep_code === "978") {
      return {
        dep_code: academie.dep_code,
        aca_nom: guadeloupeAcademie.aca_nom,
        aca_id: guadeloupeAcademie.aca_id,
        aca_code: guadeloupeAcademie.aca_code,
      };
    }

    return academie;
  });
}

export async function fetchAcademies(): Promise<IEnseignementSupAcademieData[]> {
  return apiEnseignementSup(async (client) => {
    try {
      const { data } = await client.get(
        "/api/explore/v2.1/catalog/datasets/fr-esr-referentiel-geographique/exports/json",
        {
          params: {
            group_by: "dep_code,aca_nom,aca_id,aca_code",
          },
        }
      );

      return fixGuadeloupeAcademie(z.parse(z.array(zAcademieData), data));
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.enseignementSup: unable to fetchAcademies", { data: error.toJSON() });
      }
      throw withCause(internal("api.enseignementSup: unable to fetchAcademies"), error);
    }
  });
}
