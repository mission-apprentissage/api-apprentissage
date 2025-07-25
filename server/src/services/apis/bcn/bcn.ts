import type { ReadStream } from "node:fs";

import { internal } from "@hapi/boom";
import axios, { isAxiosError } from "axios";
import type { ISourceBcn } from "shared/models/source/bcn/source.bcn.model";

import { withCause } from "@/services/errors/withCause.js";
import { downloadFileAsStream } from "@/utils/apiUtils.js";

const bcnClient = axios.create({
  baseURL: "https://bcn.depp.education.fr/bcn",
  timeout: 90_000,
});

export async function fetchBcnData(table: ISourceBcn["source"]): Promise<ReadStream> {
  try {
    const response = await bcnClient({
      method: "POST",
      url: "/index.php/export/CSV",
      params: {
        n: table,
        separator: ";",
        withForeign: true,
      },
      responseType: "stream",
    });

    return await downloadFileAsStream(response.data, `bcn_${table}.zip`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw internal("api.bcn: unable to fetchBcnData", { data: error.toJSON() });
    }
    throw withCause(internal("api.bcn: unable to fetchBcnData"), error);
  }
}
