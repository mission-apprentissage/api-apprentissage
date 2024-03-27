import type { Readable } from "node:stream";

import { compose } from "oleoduc";

import config from "@/config";

import { downloadFileInTmpFile } from "../../../utils/apiUtils";
import { createJsonLineTransformStream } from "../../../utils/streamUtils";
import getApiClient from "../client";

const catalogueEducatifClient = getApiClient(
  {
    baseURL: config.api.catalogueEducatif.baseurl,
  },
  { cache: false }
);

let cookieAuthCatalogueEducatif = "";

export async function authCatalogueEducatif(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await catalogueEducatifClient.post<any>("/api/v1/auth/login", {
    username: config.api.catalogueEducatif.username,
    password: config.api.catalogueEducatif.password,
  });
  return response.headers["set-cookie"]?.join(";") || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchFormationCatalogueEducatif(cle_ministere_educatif: string): Promise<any> {
  if (!cookieAuthCatalogueEducatif) {
    cookieAuthCatalogueEducatif = (await authCatalogueEducatif()) || "";
  }

  const query = JSON.stringify({
    cle_ministere_educatif,
    uai_formation_valide: true,
    $and: [{ uai_formation: { $ne: null } }, { uai_formation: { $ne: "" } }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await catalogueEducatifClient.get<any>("/api/v1/entity/formations", {
    headers: { cookie: cookieAuthCatalogueEducatif },
    params: {
      query,
      select: JSON.stringify({
        uai_formation: 1,
      }),
    },
  });

  if (!response.data.formations.length) return { uai_formation: null };

  return response.data.formations[0];
}

export async function fetchCatalogueEducatifData(): Promise<Readable> {
  if (!cookieAuthCatalogueEducatif) {
    cookieAuthCatalogueEducatif = (await authCatalogueEducatif()) || "";
  }
  const query = JSON.stringify({
    catalogue_published: true,
    uai_formation_valide: true,
    $and: [{ uai_formation: { $ne: null } }, { uai_formation: { $ne: "" } }],
  });

  const countResponse = await catalogueEducatifClient.get<number>("/api/v1/entity/formations/count", {
    params: { query },
  });

  const response = await catalogueEducatifClient.get<Readable>("/api/v1/entity/formations.json", {
    responseType: "stream",
    params: {
      query,
      select: JSON.stringify({
        cle_ministere_educatif: 1,
        uai_formation: 1,
      }),
      limit: countResponse.data,
    },
  });

  return compose(await downloadFileInTmpFile(response.data, "catalogueEducatif.zip"), createJsonLineTransformStream());
}
