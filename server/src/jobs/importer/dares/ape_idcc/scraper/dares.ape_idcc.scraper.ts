import { internal } from "@hapi/boom";
import { ReadStream } from "fs";
import { parse } from "node-html-parser";
import { IImportMetaDares } from "shared/models/import.meta.model";

import getApiClient from '@/services/apis/client.js';
import { withCause } from '@/services/errors/withCause.js';
import { downloadFileAsStream } from '@/utils/apiUtils.js';

const client = getApiClient(
  {
    baseURL: "https://dares.travail-emploi.gouv.fr/",
    timeout: 300_000,
  },
  { cache: false }
);

export async function scrapeRessourceApeIdcc(): Promise<IImportMetaDares["resource"]> {
  const raw = await client.get<string>("/donnees/les-portraits-statistiques-de-branches-professionnelles", {
    responseType: "document",
  });
  const title = "Table de passage entre la convention collective (code IDCC) et le secteur d’activité (code APE)";
  const root = parse(raw.data);
  const links = root.querySelectorAll(`a.xlsx[data-title='${title}']`);

  const linkNode = links.at(0);

  if (links.length !== 1 || linkNode == null) {
    throw internal("dares.ape_idcc.scraper: unexpected number of links", { links });
  }

  const href = linkNode.getAttribute("href");

  if (!href) {
    throw internal("dares.ape_idcc.scraper: unexpected missing href", { links });
  }

  const url = new URL(href, client.defaults.baseURL);
  const linkHead = await client.head(href);
  const date = new Date(linkHead.headers["last-modified"] as string);

  if (!date || Number.isNaN(date.getTime())) {
    throw internal("dares.ape_idcc.scraper: unexpected missing last-modified", { links });
  }

  return {
    url: url.href,
    date,
    title,
  };
}

export async function downloadResourceApeIdccFile(resource: IImportMetaDares["resource"]): Promise<ReadStream> {
  try {
    const response = await client.get<ReadStream>(resource.url, {
      responseType: "stream",
    });

    return await downloadFileAsStream(response.data, new URL(resource.url).pathname.split("/").pop() ?? "");
  } catch (error) {
    throw withCause(internal("dares.ape_idcc.scraper: unable to downloadResourceCcnFile", { resource }), error);
  }
}
