import { internal } from "@hapi/boom";
import { createReadStream, ReadStream } from "fs";
import { parse } from "node-html-parser";
import unzipper, { Entry } from "unzipper";

import getApiClient from "@/services/apis/client";
import { withCause } from "@/services/errors/withCause";
import { downloadFileInTmpFile } from "@/utils/apiUtils";
import { getStaticFilePath } from "@/utils/getStaticFilePath";

const client = getApiClient(
  {
    baseURL: "https://www.francecompetences.fr/referentiels-et-bases-de-donnees",
    timeout: 300_000,
  },
  { cache: false }
);

export async function scrapeRessourceNPEC(): Promise<string[]> {
  const result: string[] = [];

  let page = 1;
  const maxPage = 10;

  while (page <= maxPage) {
    const raw = await client.get<string>(
      `?thematics=financement-de-la-formation-professionnelle-et-de-lapprentissage&group=referentiels&paged=${page}`,
      { responseType: "document" }
    );
    const root = parse(raw.data);
    const links = root.querySelectorAll(".block--documents-list__results a[download]");

    if (links.length === 0) {
      return result;
    }

    links.forEach((a) => {
      result.push(a.getAttribute("href") ?? "");
    });

    page++;
  }

  throw internal("npec.importer: unexpected number of pages", { maxPage, result });
}

async function downloadResourceFile(url: string) {
  try {
    const response = await client.get<ReadStream>(url, {
      responseType: "stream",
    });

    return await downloadFileInTmpFile(response.data, new URL(url).pathname.split("/").pop() ?? "");
  } catch (error) {
    throw withCause(internal("npec.scraper: unable to downloadResourceNPEC", { url }), error);
  }
}

export async function downloadXlsxNPECFile(url: string): Promise<NodeJS.ReadableStream> {
  let filename = new URL(url).pathname.split("/").at(-1);
  if (!filename) {
    throw internal("npec.scraper.downloadXlsxNPECFile: cannot find filename", { url });
  }
  filename = decodeURIComponent(filename);

  // We are unable to parse xlsb files without blowing up memory
  // This is only present in 2 old files, hence we will use manually converted xlsx files
  if (filename === "Referentiel-NPEC-20222023_v24.08.203.xlsb.zip") {
    return createReadStream(getStaticFilePath("npec/Referentiel-NPEC-20222023_v24.08.203.xlsx"));
  }

  if (filename === "VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc.xlsb.zip") {
    return createReadStream(getStaticFilePath("npec/VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc.xlsx"));
  }

  if (filename.endsWith(".xlsx")) {
    return await downloadResourceFile(url);
  }

  if (filename.endsWith(".zip")) {
    const readStream = await downloadResourceFile(url);
    const zip = readStream.pipe(unzipper.Parse({ forceStream: true }));

    const entries: Entry[] = [];
    for await (const entry of zip) {
      entries.push(entry);
    }

    if (entries.length === 0) {
      throw internal("npec.scraper.downloadXlsxNPECFile: no entry found in zip", { url });
    }

    if (entries.length > 1) {
      throw internal("npec.scraper.downloadXlsxNPECFile: too many entries found in zip", { url });
    }

    const entry = entries[0];
    if (entry.type !== "File") {
      throw internal("npec.scraper.downloadXlsxNPECFile: unexpected entry type", {
        type: entry.type,
        path: entry.path,
      });
    }

    if (!entry.path.endsWith(".xlsx")) {
      throw internal("npec.scraper.downloadXlsxNPECFile: unexpected file type", {
        type: entry.type,
        path: entry.path,
      });
    }

    return entry;
  }

  throw internal("npec.scraper.downloadXlsxNPECFile: unexpected file extension", { filename });
}
