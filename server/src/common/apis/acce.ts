import { AxiosInstance } from "axios";

import logger from "@/common/logger";
import config from "@/config";

import { apiRateLimiter } from "../utils/apiUtils";
import { delay } from "../utils/asyncUtils";
import { fetchData, fetchStream } from "../utils/httpUtils";
import getApiClient from "./client";

export const LIMIT_TRAINING_LINKS_PER_REQUEST = 100;

const CHROME_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36";

const SESSION_COOKIE_NAME = "men_default";

const executeWithRateLimiting = apiRateLimiter("acce", {
  nbRequests: 1,
  durationInSeconds: 1,
  maxQueueSize: LIMIT_TRAINING_LINKS_PER_REQUEST,
  client: getApiClient(
    {
      baseURL: "https://dep.adc.education.fr/acce",
      timeout: 0, // no timeout
    },
    { cache: false }
  ),
});

function getFormHeaders(auth?: any) {
  return {
    "User-Agent": CHROME_USER_AGENT,
    "Content-Type": "application/x-www-form-urlencoded",
    ...(auth || {}),
  };
}

async function login() {
  return executeWithRateLimiting(async (client: AxiosInstance) => {
    logger.debug(`Logging to ACCE...`);

    const response = await fetchData(
      `/ajax/ident.php`,
      {
        raw: true,
        method: "POST",
        headers: getFormHeaders(),
        data: {
          id: config.api.acce.username,
          mdp: config.api.acce.password,
          nom: null,
          prenom: null,
          email: null,
          fonction: null,
          organisme: null,
          commentaire: null,
        },
      },
      client
    );

    const cookie = response.headers["set-cookie"][0];
    const sessionId = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=(.*);`))[1];
    return {
      Cookie: `${SESSION_COOKIE_NAME}=${sessionId}`,
    };
  });
}

async function startExtraction(auth: any) {
  return executeWithRateLimiting(async (client: AxiosInstance) => {
    logger.debug(`Requesting a new extraction...`);

    const params = new URLSearchParams();
    params.append("opt_sort_uai", "numero_uai");
    params.append("opt_type", "csv");
    params.append("chk_uai[]", "nature_uai");
    params.append("chk_uai[]", "nature_uai_libe");
    params.append("chk_uai[]", "etat_etablissement");
    params.append("chk_uai[]", "etat_etablissement_libe");
    params.append("chk_uai[]", "mel_uai");

    const { data } = await client.post(`/getextract.php`, {
      headers: getFormHeaders(auth),
      data: params.toString(),
    });

    const [, extractionId] = data.match(/getextract\.php\?ex_id=(.*)"/);

    return { extractionId };
  });
}

async function pollExtraction(auth: any, extractionId: string) {
  return executeWithRateLimiting(async (client: AxiosInstance) => {
    logger.debug(`Polling extraction ${extractionId}...`);

    const response = await fetchStream(
      `/getextract.php?ex_id=${extractionId}`,
      {
        raw: true,
        encoding: "iso-8859-1",
        method: "GET",
        headers: {
          "User-Agent": CHROME_USER_AGENT,
          ...auth,
        },
      },
      client
    );

    const isReady = response.headers["content-disposition"]?.startsWith("attachement");
    if (!isReady) {
      response.stream.destroy();
      return null;
    }
    return response.stream;
  });
}

export async function streamCsvExtraction() {
  const auth = await login();

  let stream;
  const { extractionId } = await startExtraction(auth);
  while (!(stream = await pollExtraction(auth, extractionId))) {
    await delay(5000); // pollMs
  }

  return stream;
}
