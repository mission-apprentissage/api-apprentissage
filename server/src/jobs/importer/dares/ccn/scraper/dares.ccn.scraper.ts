import type { ReadStream } from "fs";
import { internal } from "@hapi/boom";
import { parse } from "node-html-parser";
import type { IImportMetaDares } from "shared/models/import.meta.model";

import axios from "axios";
import { withCause } from "@/services/errors/withCause.js";
import { downloadFileAsStream } from "@/utils/apiUtils.js";

const client = axios.create({
  baseURL: "https://travail-emploi.gouv.fr",
  timeout: 300_000,
});

export async function scrapeRessourceCcn(): Promise<IImportMetaDares["resource"]> {
  const raw = await client.get<string>(
    "/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures",
    { responseType: "document" }
  );
  const root = parse(raw.data);
  const links = root.querySelectorAll(
    'a.fr-link--download.file--x-office-spreadsheet[title*="Liste des conventions collectives et de leur code IDCC"]'
  );
  const linkNode = links.at(0);

  if (links.length !== 1 || linkNode == null) {
    throw internal("dares.ccn.scraper: unexpected number of links", { links });
  }

  const href = linkNode.getAttribute("href");

  if (!href) {
    throw internal("dares.ccn.scraper: unexpected missing href", { links });
  }

  const url = new URL(href, client.defaults.baseURL);
  const linkHead = await client.head(href);
  const date = new Date(linkHead.headers["last-modified"] as string);

  if (!date || Number.isNaN(date.getTime())) {
    throw internal("dares.ccn.scraper: unexpected missing last-modified", { links });
  }

  const title = linkNode.attributes["data-tracking-download-label"] ?? null;

  if (!title) {
    throw internal("dares.ccn.scraper: unexpected missing title", { links });
  }

  return {
    url: url.href,
    date,
    title,
  };
}

export async function downloadResourceCcnFile(resource: IImportMetaDares["resource"]): Promise<ReadStream> {
  try {
    const response = await client.get<ReadStream>(resource.url, {
      responseType: "stream",
    });

    return await downloadFileAsStream(response.data, new URL(resource.url).pathname.split("/").pop() ?? "");
  } catch (error) {
    throw withCause(internal("dares.ccn.scraper: unable to downloadResourceCcnFile", { resource }), error, "fatal");
  }
}
