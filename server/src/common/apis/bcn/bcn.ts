import { ReadStream } from "node:fs";

import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";

import { withCause } from "../../errors/withCause";
import getApiClient from "../client";

export type BCN_TABLE =
  | "V_FORMATION_DIPLOME"
  | "N_FORMATION_DIPLOME"
  | "N_FORMATION_DIPLOME_ENQUETE_51"
  | "N_NIVEAU_FORMATION_DIPLOME";

const bcnClient = getApiClient(
  {
    baseURL: "https://infocentre.pleiade.education.fr/bcn",
    timeout: 90_000,
  },
  { cache: false }
);

export async function fetchBcnData(table: BCN_TABLE): Promise<ReadStream> {
  try {
    const response = await bcnClient({
      method: "POST",
      url: "/index.php/export/CSV",
      params: {
        n: table,
        separator: ";",
      },
      responseType: "stream",
    });

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw internal("api.bcn: unable to fetchBcnData", { data: error.toJSON() });
    }
    throw withCause(internal("api.bcn: unable to fetchBcnData"), error);
  }
}
