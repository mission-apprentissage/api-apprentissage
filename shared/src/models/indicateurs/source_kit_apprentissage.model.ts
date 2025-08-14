import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../common.js";
import { zObjectIdMini } from "../common.js";

const collectionName = "indicateurs.source_kit_apprentissage" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ date: 1 }, { unique: true }]];

export const zIndicateurSourceKitApprentissage = z.object({
  _id: zObjectIdMini,
  date: z.date(),
  missingRncp: z.number(),
  missingCfd: z.number(),
});

export type IIndicateurSourceKitApprentissage = z.output<typeof zIndicateurSourceKitApprentissage>;

export const indicateurSourceKitApprentissageModelDescriptor = {
  zod: zIndicateurSourceKitApprentissage,
  indexes,
  collectionName,
};
