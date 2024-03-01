import { ReadStream } from "node:fs";

import { internal } from "@hapi/boom";
import { IDataGouvDataset, IDataGouvDatasetResource, zDataGouvDataset } from "shared";
import { ZodError } from "zod";

import { withCause } from "../../errors/withCause";
import { downloadFileInTmpFile } from "../../utils/apiUtils";
import getApiClient from "../client";

const client = getApiClient(
  {
    baseURL: "https://www.data.gouv.fr/api/1",
    timeout: 120_000,
  },
  { cache: false }
);

export async function fetchDataGouvDataSet(datasetId: string): Promise<IDataGouvDataset> {
  try {
    const { data } = await client.get<unknown>(`/datasets/${datasetId}`);

    return zDataGouvDataset.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw withCause(
        internal("api.data_gouv: unable to fetchDataGouvDataSet; unexpected api data", { datasetId }),
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

    return await downloadFileInTmpFile(response.data, resource.title);
  } catch (error) {
    throw withCause(internal("api.data_gouv: unable to downloadDataGouvResource", { resource }), error);
  }
}
