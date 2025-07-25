import type { ReadStream } from "fs";
import { createReadStream, createWriteStream } from "fs";
import { basename, dirname, extname, join } from "path";
import type { Stream } from "stream";
import { pipeline } from "stream/promises";
import { parse } from "node-html-parser";
import { DateTime } from "luxon";
import { internal } from "@hapi/boom";
import { Parse } from "unzipper";

import axios from "axios";
import { withCause } from "@/services/errors/withCause.js";
import { cleanupTmp, downloadFileAsTmp, readTmpAsStreamAndCleanup } from "@/utils/apiUtils.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";

const client = axios.create({
  baseURL: "https://www.francecompetences.fr/referentiels-et-bases-de-donnees",
  timeout: 300_000,
});

export async function scrapeRessourceNPEC(): Promise<
  { url: string; date: Date; title: string; description: string }[]
> {
  const result: { url: string; date: Date; title: string; description: string }[] = [];

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
      const url = a.getAttribute("href");

      if (!url) {
        throw internal("npec.importer: unexpected missing url", { a });
      }
      const dateString = a.querySelector(".card--documents-list__container__date")?.text.trim() ?? "";
      if (!dateString) {
        throw internal("npec.importer: unexpected missing date", { a });
      }
      const title = a.querySelector(".card--documents-list__container__title")?.text.trim() ?? "";
      if (!title) {
        throw internal("npec.importer: unexpected missing title", { a });
      }
      const description = a.querySelector(".card--documents-list__container__description")?.text.trim() ?? "";
      if (!description) {
        throw internal("npec.importer: unexpected missing description", { a });
      }
      const date = DateTime.fromFormat(`${dateString} 00:00:00`, "dd.MM.yy HH:mm:ss", {
        zone: "Europe/Paris",
      }).toJSDate();
      result.push({ url, date, title, description });
    });

    page++;
  }

  throw internal("npec.importer: unexpected number of pages", { maxPage, result });
}

async function downloadResourceFile(url: string): Promise<string> {
  try {
    const response = await client.get<ReadStream>(url, {
      responseType: "stream",
    });

    return await downloadFileAsTmp(response.data, new URL(url).pathname.split("/").pop() ?? "");
  } catch (error) {
    throw withCause(internal("npec.scraper: unable to downloadResourceNPEC", { url }), error);
  }
}

export function getNpecFilename(url: string): string {
  const filename = new URL(url).pathname.split("/").at(-1);
  if (!filename) {
    throw internal("npec.scraper.downloadXlsxNPECFile: cannot find filename", { url });
  }
  return decodeURIComponent(filename);
}

async function extractNpecZipFile(filepath: string): Promise<ReadStream> {
  const readStream = createReadStream(filepath);
  const name = basename(filepath, extname(filepath));
  const destFile = join(dirname(filepath), `${name}-output.xlsx`);

  try {
    const zip = readStream.pipe(Parse({ forceStream: true }));

    let isFileFound = false;

    for await (const entry of zip) {
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

      if (isFileFound) {
        entry.autodrain();
        throw internal("npec.scraper.downloadXlsxNPECFile: too many entries found in zip");
      }

      isFileFound = true;
      await pipeline(entry, createWriteStream(destFile));
    }

    if (!isFileFound) {
      throw internal("npec.scraper.downloadXlsxNPECFile: no entry found in zip");
    }

    return await readTmpAsStreamAndCleanup(destFile);
  } catch (error) {
    readStream.destroy();
    // This will remove the tmp directory
    await cleanupTmp(filepath);
    throw error;
  }
}

export async function downloadXlsxNPECFile(url: string): Promise<Stream> {
  const filename = getNpecFilename(url);

  // We are unable to parse xlsb files without blowing up memory
  // This is only present in 2 old files, hence we will use manually converted xlsx files
  if (filename === "Referentiel-NPEC-20222023_v24.08.203.xlsb.zip") {
    return createReadStream(getStaticFilePath("npec/Referentiel-NPEC-20222023_v24.08.203.xlsx"));
  }

  if (filename === "VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc.xlsb.zip") {
    return createReadStream(getStaticFilePath("npec/VF_17.03.2021_Référentiel-NPEC-20192020_avec_idcc.xlsx"));
  }

  if (filename.endsWith(".xlsx")) {
    const filepath = await downloadResourceFile(url);
    return readTmpAsStreamAndCleanup(filepath);
  }

  if (filename.endsWith(".zip")) {
    const filepath = await downloadResourceFile(url);
    return await extractNpecZipFile(filepath);
  }

  throw internal("npec.scraper.downloadXlsxNPECFile: unexpected file extension", { filename });
}
