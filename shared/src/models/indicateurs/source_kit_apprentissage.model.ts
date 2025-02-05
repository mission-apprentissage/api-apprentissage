import { z } from "zod";

import type { IModelDescriptorGeneric } from "../common.js";
import { zObjectId } from "../common.js";

const collectionName = "indicateurs.source_kit_apprentissage" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ date: 1 }, { unique: true }]];

export const zIndicateurSourceKitApprentissage = z.object({
  _id: zObjectId,
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
