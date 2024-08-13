import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";

import config from "@/config.js";
import getApiClient from '@/services/apis/client.js';
import { withCause } from '@/services/errors/withCause.js';
import { apiRateLimiter } from '@/utils/apiUtils.js';

/**
 * Documentation https://bal.apprentissage.beta.gouv.fr/api/documentation/static/index.html
 */
const apiBalClient = apiRateLimiter("apiBal", {
  nbRequests: 2,
  durationInSeconds: 1,
  client: getApiClient({
    baseURL: config.api.bal.baseurl,
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const countOrganismeContrats = async (siret: string): Promise<any> => {
  return apiBalClient(async (client) => {
    try {
      const { data } = await client.post(
        `/v1/deca/search/organisme`,
        {
          siret,
        },
        {
          headers: {
            Authorization: `Bearer ${config.api.bal.apiKey}`,
          },
        }
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.bal: unable to get deca count contrat", { data: error.toJSON() });
      }
      throw withCause(internal("api.bal: unable to get deca count contrat"), error);
    }
  });
};
