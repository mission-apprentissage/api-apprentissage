import { internal, isBoom } from "@hapi/boom";
import { isAxiosError } from "axios";
import type { ISourceUnmlPayload } from "shared";
import { zSourceUnmlPayload } from "shared";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const unmlClient = apiRateLimiter("unml", {
  nbRequests: 10,
  durationInSeconds: 1,
  client: getApiClient(
    {
      baseURL: config.api.unml.endpoint,
    },
    { cache: false }
  ),
});

export async function fetchDepartementMissionLocale(codeDepartement: string): Promise<ISourceUnmlPayload> {
  return unmlClient(async (client) => {
    try {
      const { data } = await client.get(`/TrouveTaML/?search_=${codeDepartement}`);

      const result = zSourceUnmlPayload.safeParse(data);

      if (!result.success) {
        throw internal("api.unml: unable to parse payload", { data, error: result.error });
      }

      return result.data;
    } catch (error) {
      if (isBoom(error)) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw internal("api.unml: unable to fetchDepartementMissionLocale", { data: error.toJSON() });
      }
      throw withCause(internal("api.unml: unable to fetchDepartementMissionLocale"), error);
    }
  });
}
