import type { ReadStream } from "node:fs";

import { internal } from "@hapi/boom";
import type { IDataGouvDataset, IDataGouvDatasetResource } from "shared";
import { zDataGouvDataset } from "shared";

import { $ZodError, prettifyError } from "zod/v4/core";
import axios from "axios";
import { withCause } from "@/services/errors/withCause.js";
import logger from "@/services/logger.js";
import { downloadFileAsStream } from "@/utils/apiUtils.js";

const client = axios.create({
  baseURL: "https://www.data.gouv.fr/api/1",
  timeout: 300_000,
});

export async function fetchDataGouvDataSet(datasetId: string): Promise<IDataGouvDataset> {
  let data: unknown;
  try {
    const result = await client.get<unknown>(`/datasets/${datasetId}`);
    data = result.data;
    return zDataGouvDataset.parse(data);
  } catch (error) {
    if (error instanceof $ZodError) {
      logger.error("api.data_gouv: unable to fetchDataGouvDataSet; unexpected api data", {
        datasetId,
        formattedError: prettifyError(error),
      });
      throw withCause(
        internal("api.data_gouv: unable to fetchDataGouvDataSet; unexpected api data", {
          datasetId,
          data,
          formattedError: prettifyError(error),
        }),
        error
      );
    }

    throw withCause(internal("api.data_gouv: unable to fetchDataGouvDataSet", { datasetId }), error);
  }
}

export async function downloadDataGouvResource(resource: IDataGouvDatasetResource) {
  try {
    const response = await client.get<ReadStream>(resource.latest, {
      responseType: "stream",
    });

    return await downloadFileAsStream(response.data, resource.title);
  } catch (error) {
    throw withCause(internal("api.data_gouv: unable to downloadDataGouvResource", { resource }), error);
  }
}
