import { internal, isBoom } from "@hapi/boom";
import type { AxiosInstance } from "axios";
import axios, { isAxiosError } from "axios";
import { z } from "zod/v4-mini";

import config from "@/config.js";
import { withCause } from "@/services/errors/withCause.js";
import { apiRateLimiter } from "@/utils/apiUtils.js";

const kitClient = apiRateLimiter("kit_apprentissage", {
  nbRequests: 1,
  durationInSeconds: 60,
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
    const response = await client.get(`/cfd_rncp_intitule?page_num=${page}&page_size=${PAGE_SIZE}`, {
      headers: {
        "token-connexion": config.api.kit_apprentissage.token,
      },
    });

    return zKitApprentissageResponse.parse(response.data);
  });
}

export async function* getKitApprentissageData(): AsyncGenerator<
  { cfd: string | null; rncp: string | null },
  void,
  void
> {
  try {
    const firstPage = await getKitApprentissagePage(1);
    const totalPages = Math.ceil(firstPage.total / PAGE_SIZE);

    yield* firstPage.data;

    for (let page = 2; page <= totalPages; page++) {
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
