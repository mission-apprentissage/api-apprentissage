import { z } from "zod";

import { IModelDescriptor, zObjectId } from "../../common";

const collectionName = "source.kit_apprentissage" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ date: 1, source: 1 }, {}],
  [{ "data.Code Diplôme": 1, "data.FicheRNCP": 1 }, { unique: true }],
  [{ "data.FicheRNCP": 1, "data.Code Diplôme": 1 }, { unique: true }],
];

export const zKitApprentissageData = z
  .object({
    "Code Diplôme": z.string().nullable(),
    "Intitulé diplôme (DEPP)": z.string().nullable(),
    FicheRNCP: z.string().nullable(),
    "Niveau fiche RNCP": z.string().nullable(),
    "Abrégé de diplôme (RNCP)": z.string().nullable(),
    "Dernière MaJ": z.string().nullable(),
    "Accès à l'apprentissage de la fiche RNCP (oui/non)": z.string().nullable(),
    "Date d'échéance de la fiche RNCP": z.string().nullable(),
    "Fiche ACTIVE/INACTIVE": z.string().nullable(),
  })
  .strict();

export const zKitApprentissage = z
  .object({
    _id: zObjectId,
    source: z.literal("kit_apprentissage_20240119.csv"),
    date: z.date(),
    data: zKitApprentissageData,
  })
  .strict();

export const sourceKitApprentissageModelDescriptor = {
  zod: zKitApprentissage,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;

export type ISourceKitApprentissage = z.output<typeof zKitApprentissage>;
