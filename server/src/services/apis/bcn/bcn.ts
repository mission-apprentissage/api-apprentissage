import { ReadStream } from "node:fs";

import { internal } from "@hapi/boom";
import { isAxiosError } from "axios";
import { ISourceBcn } from "shared/models/source/bcn/source.bcn.model";

import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";
import { downloadFileAsStream } from "@/utils/apiUtils.js";

const bcnClient = getApiClient(
  {
    baseURL: "https://infocentre.pleiade.education.fr/bcn",
    timeout: 90_000,
  },
  { cache: false }
);

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
