import { internal, isBoom } from "@hapi/boom";
import axios, { isAxiosError } from "axios";
import type { ISourceUnmlPayload } from "shared";
import { zSourceUnmlPayload } from "shared";

import config from "@/config.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const unmlClient = apiRateLimiter("unml", {
  nbRequests: 10,
  durationInSeconds: 1,
  client: axios.create({
    timeout: 30_000,
    baseURL: config.api.unml.endpoint,
  }),
  timeout: 900_000, // 15 minutes
  maxQueueSize: 100,
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
