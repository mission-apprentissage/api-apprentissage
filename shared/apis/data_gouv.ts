import { z } from "zod";

export const zDataGouvDatasetResource = z
  .object({
    created_at: z.string().datetime({ offset: true }).pipe(z.coerce.date()),
    id: z.string(),
    last_modified: z.string().datetime({ offset: true }).pipe(z.coerce.date()),
    latest: z.string().url(),
    title: z.string(),
  })
  .strict();

export type IDataGouvDatasetResource = z.output<typeof zDataGouvDatasetResource>;

export const zDataGouvDataset = z
  .object({
    id: z.string(),
    title: z.string(),
    resources: z.array(zDataGouvDatasetResource),
  })
  .strict();

export type IDataGouvDataset = z.output<typeof zDataGouvDataset>;
