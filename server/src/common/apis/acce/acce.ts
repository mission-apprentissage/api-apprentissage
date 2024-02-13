import { createReadStream, type ReadStream } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import querystring from "node:querystring";

import { internal } from "@hapi/boom";
import { AxiosInstance, isAxiosError } from "axios";

import logger from "@/common/logger";
import config from "@/config";

import { withCause } from "../../errors/withCause";
import { apiRateLimiter } from "../../utils/apiUtils";
import { sleep } from "../../utils/asyncUtils";
import getApiClient from "../client";

const CHROME_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36";

const SESSION_COOKIE_NAME = "men_default";

const acceClient = apiRateLimiter("acce", {
  nbRequests: 1,
  durationInSeconds: 1,
  client: getApiClient(
    {
      baseURL: "https://dep.adc.education.fr/acce",
      timeout: 900_000,
    },
    { cache: false }
  ),
});

function getFormHeaders(auth?: { Cookie: string }) {
  return {
    "User-Agent": CHROME_USER_AGENT,
    "Content-Type": "application/x-www-form-urlencoded",
    ...(auth || {}),
  };
}

export async function login() {
  return acceClient(async (client: AxiosInstance) => {
    try {
      logger.debug(`Logging to ACCE...`);

      const data = JSON.stringify({
        id: config.api.acce.username,
        mdp: config.api.acce.password,
        nom: null,
        prenom: null,
        email: null,
        fonction: null,
        organisme: null,
        commentaire: null,
        captcha_code: null,
      });
      const response = await client.post(`/ajax/ident.php`, querystring.stringify({ json: data }), {
        headers: getFormHeaders(),
      });

      const cookie = response.headers["set-cookie"]?.[0] ?? null;

      if (!cookie) {
        throw internal("api.acce: missing connexion cookie", { headers: response.headers });
      }

      const sessionMatch = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=(.*);`));

      if (!sessionMatch) {
        throw internal("api.acce: invalid session name");
      }

      return {
        Cookie: `${SESSION_COOKIE_NAME}=${sessionMatch[1]}`,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.acce: unable to login", { data: error.toJSON() });
      }
      throw withCause(internal("api.acce: unable to login"), error);
    }
  });
}

async function startExtraction(auth: { Cookie: string }) {
  return acceClient(async (client: AxiosInstance) => {
    try {
      logger.debug(`Requesting a new extraction...`);

      const params = new URLSearchParams();

      //ACCE_UAI.csv
      params.append("opt_sort_uai", "numero_uai");
      params.append("opt_type", "csv");
      params.append("chk_uai[]", "nature_uai");
      params.append("chk_uai[]", "nature_uai_libe");
      params.append("chk_uai[]", "type_uai");
      params.append("chk_uai[]", "type_uai_libe");
      params.append("chk_uai[]", "etat_etablissement");
      params.append("chk_uai[]", "etat_etablissement_libe");
      params.append("chk_uai[]", "ministere_tutelle");
      params.append("chk_uai[]", "ministere_tutelle_libe");
      params.append("chk_uai[]", "tutelle_secondaire");
      params.append("chk_uai[]", "tutelle_secondaire_libe");
      params.append("chk_uai[]", "secteur_public_prive");
      params.append("chk_uai[]", "secteur_public_prive_libe");
      params.append("chk_uai[]", "sigle_uai");
      params.append("chk_uai[]", "categorie_juridique");
      params.append("chk_uai[]", "categorie_juridique_libe");
      params.append("chk_uai[]", "contrat_etablissement");
      params.append("chk_uai[]", "contrat_etablissement_libe");
      params.append("chk_uai[]", "categorie_financiere");
      params.append("chk_uai[]", "categorie_financiere_libe");
      params.append("chk_uai[]", "situation_comptable");
      params.append("chk_uai[]", "situation_comptable_libe");
      params.append("chk_uai[]", "niveau_uai");
      params.append("chk_uai[]", "niveau_uai_libe");
      params.append("chk_uai[]", "commune");
      params.append("chk_uai[]", "commune_libe");
      params.append("chk_uai[]", "academie");
      params.append("chk_uai[]", "academie_libe");
      params.append("chk_uai[]", "pays");
      params.append("chk_uai[]", "pays_libe");
      params.append("chk_uai[]", "departement_insee_3");
      params.append("chk_uai[]", "departement_insee_3_libe");
      params.append("chk_uai[]", "denomination_principale_uai");
      params.append("chk_uai[]", "appellation_officielle");
      params.append("chk_uai[]", "patronyme_uai");
      params.append("chk_uai[]", "hebergement_etablissement");
      params.append("chk_uai[]", "hebergement_etablissement_libe");
      params.append("chk_uai[]", "numero_siren_siret_uai");
      params.append("chk_uai[]", "numero_finess_uai");
      params.append("chk_uai[]", "date_ouverture");
      params.append("chk_uai[]", "date_fermeture");
      params.append("chk_uai[]", "date_derniere_mise_a_jour");
      params.append("chk_uai[]", "lieu_dit_uai");
      params.append("chk_uai[]", "adresse_uai");
      params.append("chk_uai[]", "boite_postale_uai");
      params.append("chk_uai[]", "code_postal_uai");
      params.append("chk_uai[]", "etat_sirad_uai");
      params.append("chk_uai[]", "localite_acheminement_uai");
      params.append("chk_uai[]", "pays_etranger_acheminement");
      params.append("chk_uai[]", "numero_telephone_uai");
      params.append("chk_uai[]", "numero_telecopieur_uai");
      params.append("chk_uai[]", "mention_distribution");
      params.append("chk_uai[]", "mel_uai");
      params.append("chk_uai[]", "site_web");
      params.append("chk_uai[]", "coordonnee_x");
      params.append("chk_uai[]", "coordonnee_y");
      params.append("chk_uai[]", "appariement");
      params.append("chk_uai[]", "appariement_complement");
      params.append("chk_uai[]", "localisation");
      params.append("chk_uai[]", "localisation_complement");
      params.append("chk_uai[]", "date_geolocalisation");
      params.append("chk_uai[]", "source");

      //ACCE_UAI_SPEC.csv
      params.append("chk_specificite[]", "numero_uai_trouve"); // numero_uai
      params.append("chk_specificite[]", "code"); // specificite_uai
      params.append("chk_specificite[]", "code_libe"); // specificite_uai_libe
      params.append("chk_specificite[]", "date_ouverture"); // date_ouverture
      params.append("chk_specificite[]", "date_fermeture"); // date_fermeture

      //ACCE_UAI_ZONE.csv
      params.append("chk_zone[]", "numero_uai_trouve"); // numero_uai
      params.append("chk_zone[]", "type_zone_uai"); // type_zone_uai
      params.append("chk_zone[]", "type_zone_uai_libe"); // type_zone_uai_libe
      params.append("chk_zone[]", "zone"); // zone
      params.append("chk_zone[]", "zone_libe"); // zone_libe
      params.append("chk_zone[]", "date_ouverture"); // date_ouverture
      params.append("chk_zone[]", "date_fermeture"); // date_fermeture
      params.append("chk_zone[]", "date_derniere_mise_a_jour"); // date_derniere_mise_a_jour

      // ACCE_UAI_FILLE.csv
      params.append("chk_filles", "1");

      //ACCE_UAI_MERE.csv
      params.append("chk_meres", "1");

      const reponse = await client.post(`/getextract.php`, params.toString(), {
        headers: getFormHeaders(auth),
      });

      const match = reponse.data.match(/getextract\.php\?ex_id=(.*)"/);

      if (!match || !match[1]) {
        throw internal("api.acce: missing extractionId", { data: reponse.data });
      }

      return { extractionId: match[1] };
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.acce: unable to startExtraction", { data: error.toJSON() });
      }
      throw withCause(internal("api.acce: unable to startExtraction"), error);
    }
  });
}

async function pollExtraction(auth: { Cookie: string }, extractionId: string) {
  return acceClient(async (client: AxiosInstance) => {
    try {
      logger.debug(`Polling extraction ${extractionId}...`);

      const response = await client.get<ReadStream>(`/getextract.php?ex_id=${extractionId}`, {
        headers: {
          "User-Agent": CHROME_USER_AGENT,
          ...auth,
        },
        responseType: "stream",
      });

      const isReady = response.headers["content-disposition"]?.startsWith("attachement");

      if (!isReady) {
        response.data.destroy();
        return null;
      }

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw internal("api.acce: unable to pollExtraction", error.toJSON());
      }
      throw withCause(internal("api.acce: unable to pollExtraction"), error);
    }
  });
}

export async function downloadCsvExtraction(): Promise<ReadStream> {
  const tmpDir = await mkdtemp(join(tmpdir(), `acce-${config.env}-`));
  const destFile = join(tmpDir, "data.zip");

  try {
    const auth = await login();

    let stream;
    const { extractionId } = await startExtraction(auth);

    // Max 30min to download
    const timeoutSignal = AbortSignal.timeout(config.env === "test" ? 150 : 30 * 60 * 1_000);
    while (!(stream = await pollExtraction(auth, extractionId))) {
      await sleep(config.env === "test" ? 10 : 5_000, timeoutSignal);
    }

    await writeFile(destFile, stream);

    const readStream = createReadStream(destFile);

    readStream.once("close", async () => {
      await rm(tmpDir, { force: true, recursive: true });
    });

    return readStream;
  } catch (error) {
    await rm(tmpDir, { force: true, recursive: true });
    throw withCause(internal("api.acce: unable to download acce database"), error);
  }
}
