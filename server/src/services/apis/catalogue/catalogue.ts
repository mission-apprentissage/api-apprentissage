import type { Readable } from "node:stream";

import { zFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import axios from "axios";
import config from "@/config.js";
import logger from "@/services/logger.js";
import { downloadFileAsStream } from "@/utils/apiUtils.js";
import { compose, createJsonLineTransformStream } from "@/utils/streamUtils.js";

const catalogueClient = axios.create({
  baseURL: config.api.catalogue.baseurl,
  timeout: 60_000,
});

const neededFieldsFromCatalogue: Record<string, number> = Object.keys(zFormationCatalogue.shape).reduce<
  Record<string, number>
>((acc, key) => {
  acc[key] = 1;
  return acc;
}, {});

export async function fetchCatalogueData(): Promise<Readable> {
  const query = JSON.stringify({ catalogue_published: true });

  const countResponse = await catalogueClient.get<number>("/api/v1/entity/formations/count", { params: { query } });

  logger.debug(`${countResponse.data} formation(s) à importer du catalogue`);

  const response = await catalogueClient.get<Readable>("/api/v1/entity/formations.json", {
    responseType: "stream",
    params: {
      query,
      limit: countResponse.data,
      select: JSON.stringify(neededFieldsFromCatalogue),
    },
  });

  return compose(await downloadFileAsStream(response.data, "catalogue.zip"), createJsonLineTransformStream());
}
