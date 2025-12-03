import { internal, isBoom } from "@hapi/boom";
import type { AxiosInstance } from "axios";
import axios, { isAxiosError } from "axios";
import { z } from "zod/v4-mini";

import logger from "../../logger.js";
import { sleep } from "../../../utils/asyncUtils.js";
import config from "@/config.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const kitClient = apiRateLimiter("kit_apprentissage", {
  nbRequests: 5,
  durationInSeconds: 10,
  client: axios.create({
    baseURL: config.api.kit_apprentissage.endpoint,
    timeout: 120_000,
  }),
  timeout: 900_000, // 15 minutes
  maxQueueSize: 100,
});

const zKitApprentissageResponse = z.object({
  total: z.number(),
  data: z.array(
    z.object({
      cfd: z.nullable(z.string()),
      rncp: z.nullable(z.string()),
    })
  ),
});

type IKitApprentissageResponse = z.infer<typeof zKitApprentissageResponse>;

const PAGE_SIZE = 100;

async function getKitApprentissagePage(page: number): Promise<IKitApprentissageResponse> {
  return kitClient(async (client: AxiosInstance) => {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.get(`/cfd_rncp_intitule?page_num=${page}&page_size=${PAGE_SIZE}`, {
          headers: {
            "token-connexion": config.api.kit_apprentissage.token,
          },
        });

        return zKitApprentissageResponse.parse(response.data);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await sleep(1000); // Wait 1s between retries
          continue;
        }
      }
    }

    throw lastError;
  });
}

export async function* getKitApprentissageData(): AsyncGenerator<
  { cfd: string | null; rncp: string | null },
  void,
  void
> {
  try {
    logger.info("getKitApprentissageData: fetching data from Kit Apprentissage API");
    const firstPage = await getKitApprentissagePage(1);
    const totalPages = Math.ceil(firstPage.total / PAGE_SIZE);

    yield* firstPage.data;

    logger.info("getKitApprentissageData: total pages to fetch: " + totalPages);
    for (let page = 2; page <= totalPages; page++) {
      logger.info(`getKitApprentissageData: fetching page ${page} of ${totalPages}`);
      const response = await getKitApprentissagePage(page);
      yield* response.data;
    }
  } catch (error) {
    if (isBoom(error)) {
      throw error;
    }

    if (isAxiosError(error)) {
      throw internal("api.kit_apprentissage: unable to getKitApprentissageData", { data: error.toJSON() });
    }
    throw withCause(internal("api.kit_apprentissage: unable to getKitApprentissageData"), error);
  }
}
