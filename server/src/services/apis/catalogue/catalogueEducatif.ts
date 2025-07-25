import type { Readable } from "node:stream";

import axios from "axios";
import config from "@/config.js";
import { downloadFileAsStream } from "@/utils/apiUtils.js";
import { compose, createJsonLineTransformStream } from "@/utils/streamUtils.js";

const catalogueEducatifClient = axios.create({
  timeout: 5000,
  baseURL: config.api.catalogueEducatif.baseurl,
});

let cookieAuthCatalogueEducatif = "";

async function authCatalogueEducatif(): Promise<string | null> {
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

  const response = await catalogueEducatifClient.get<Readable>("/api/v1/entity/formations.json", {
    responseType: "stream",
    headers: { cookie: cookieAuthCatalogueEducatif },
    params: {
      query,
      select: JSON.stringify({
        cle_ministere_educatif: 1,
        uai_formation: 1,
      }),
      limit: 1000000,
    },
  });

  return compose(await downloadFileAsStream(response.data, "catalogueEducatif.zip"), createJsonLineTransformStream());
}
