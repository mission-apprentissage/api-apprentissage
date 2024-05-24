import { internal } from "@hapi/boom";
import { parse } from "node-html-parser";

import getApiClient from "@/services/apis/client";

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
