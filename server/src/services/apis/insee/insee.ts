import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";
import { z } from "zod";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const apiInsee = apiRateLimiter("insee", {
  nbRequests: 25,
  durationInSeconds: 60,
  client: getApiClient(
    {
      baseURL: config.api.insee.endpoint,
      headers: {
        Authorization: `Bearer ${config.api.insee.token}`,
      },
    },
    { cache: false }
  ),
});

const zInseeCollectiviteOutreMer = z.object({
  code: z.string(),
  intitule: z.string(),
});

const zInseeCommuneOutreMer = z.object({
  code: z.string(),
  intitule: z.string(),
});

export type IInseeCollectiviteOutreMer = z.infer<typeof zInseeCollectiviteOutreMer>;
export type IInseeCommuneOutreMer = z.infer<typeof zInseeCommuneOutreMer>;

export async function fetchCollectivitesOutreMer(): Promise<IInseeCollectiviteOutreMer[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get("/metadonnees/V1/geo/collectivitesDOutreMer");

      return zInseeCollectiviteOutreMer.array().parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCollectivitesOutreMer", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCollectivitesOutreMer"), error);
    }
  });
}

export async function fetchCommuneOutreMer(codeCollectivite: string): Promise<IInseeCommuneOutreMer[]> {
  return apiInsee(async (client) => {
    try {
      const { data } = await client.get(`/metadonnees/V1/geo/collectivitesDOutreMer/${codeCollectivite}/descendants`, {
        params: {
          type: "commune",
        },
      });

      return zInseeCommuneOutreMer.array().parse(data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.insee: unable to fetchCommuneOutreMer", { data: error.toJSON() });
      }
      throw withCause(internal("api.insee: unable to fetchCommuneOutreMer"), error);
    }
  });
}
