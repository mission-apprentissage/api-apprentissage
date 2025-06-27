import { z } from "zod/v4-mini";

export const zDataGouvDatasetResource = z.object({
  created_at: z.pipe(z.iso.datetime({ offset: true }), z.coerce.date()),
  id: z.string(),
  last_modified: z.pipe(z.iso.datetime({ offset: true }), z.coerce.date()),
  latest: z.string().check(z.url()),
  title: z.string(),
});

export type IDataGouvDatasetResource = z.output<typeof zDataGouvDatasetResource>;

export const zDataGouvDataset = z.object({
  id: z.string(),
  title: z.string(),
  resources: z.array(zDataGouvDatasetResource),
});

export type IDataGouvDataset = z.output<typeof zDataGouvDataset>;
