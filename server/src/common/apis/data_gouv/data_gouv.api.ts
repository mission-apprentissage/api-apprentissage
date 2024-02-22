import { internal } from "@hapi/boom";
import { z, ZodError } from "zod";

import { withCause } from "../../errors/withCause";
import getApiClient from "../client";

const client = getApiClient(
  {
    baseURL: "https://www.data.gouv.fr/api/1",
  },
  { cache: false }
);

const zDataGouvDatasetResource = z.object({
  created_at: z.string().datetime({ offset: true }).pipe(z.coerce.date()),
  id: z.string(),
  last_modified: z.string().datetime({ offset: true }).pipe(z.coerce.date()),
  latest: z.string().url(),
  title: z.string(),
});

const zDataGouvDataset = z.object({
  id: z.string(),
  title: z.string(),
  resources: z.array(zDataGouvDatasetResource),
});

export type IDataGouvDataset = z.output<typeof zDataGouvDataset>;

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
