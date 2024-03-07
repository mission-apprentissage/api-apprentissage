import { z } from "zod";

import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "certifications" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ "code.cfd": 1, "code.rncp": 1 }, { unique: true }],
  [{ "code.rncp": 1, "code.cfd": 1 }, {}],
];

export const zCertification = z.object({
  _id: zObjectId,
  code: z.object({
    cfd: z.string().nullable(),
    rncp: z.string().nullable(),
  }),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICertification = z.output<typeof zCertification>;

export const certificationsModelDescriptor = {
  zod: zCertification,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;
