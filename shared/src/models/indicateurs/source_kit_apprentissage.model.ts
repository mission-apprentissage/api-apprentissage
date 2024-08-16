import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../common.js";

const collectionName = "indicateurs.source_kit_apprentissage" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ version: 1, date: 1 }, { unique: true }]];

export const zIndicateurSourceKitApprentissage = z.object({
  _id: zObjectId,
  version: z.string(),
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
