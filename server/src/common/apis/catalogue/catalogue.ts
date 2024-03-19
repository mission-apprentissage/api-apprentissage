import type { Readable } from "node:stream";

import { compose } from "oleoduc";
import { zFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import logger from "@/common/logger";
import config from "@/config";

import { downloadFileInTmpFile } from "../../utils/apiUtils";
import { createJsonLineTransformStream } from "../../utils/streamUtils";
import getApiClient from "../client";

const catalogueClient = getApiClient(
  {
    baseURL: config.api.catalogue.baseurl,
  },
  { cache: false }
);

const neededFieldsFromCatalogue = Object.keys(zFormationCatalogue.shape).reduce<Record<string, number>>((acc, key) => {
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

  return compose(await downloadFileInTmpFile(response.data, "catalogue.zip"), createJsonLineTransformStream());
}
