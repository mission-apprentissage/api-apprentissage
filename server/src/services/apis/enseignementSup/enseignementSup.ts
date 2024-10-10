import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";
import { z } from "zod";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const apiEnseignementSup = apiRateLimiter("insee", {
  nbRequests: 25,
  durationInSeconds: 60,
  client: getApiClient(
    {
      baseURL: config.api.enseignementSup.endpoint,
    },
    { cache: false }
  ),
});

const zAcademieData = z.object({
  dep_code: z.string(),
  aca_nom: z.string(),
  aca_id: z.string(),
  aca_code: z.string(),
});

export type IEnseignementSupAcademieData = z.infer<typeof zAcademieData>;

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

      return zAcademieData.array().parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.enseignementSup: unable to fetchAcademies", { data: error.toJSON() });
      }
      throw withCause(internal("api.enseignementSup: unable to fetchAcademies"), error);
    }
  });
}
