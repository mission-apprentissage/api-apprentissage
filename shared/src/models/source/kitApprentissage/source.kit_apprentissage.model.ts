import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../../common.js";

const collectionName = "source.kit_apprentissage" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date: 1, source: 1 }, {}],
  [{ "data.Code Diplôme": 1, "data.FicheRNCP": 1 }, {}],
  [{ "data.FicheRNCP": 1, "data.Code Diplôme": 1 }, {}],
  [{ "data.FicheRNCP": 1, version: 1 }, {}],
  [{ "data.Code Diplôme": 1, version: 1 }, {}],
];

export const zKitApprentissageData = z
  .object({
    "Code Diplôme": z.string().transform((value) => {
      if (value.trim() === "NR") return "NR";
      return value.trim().padStart(8, "0");
    }),
    "Intitulé diplôme (DEPP)": z.string().nullable(),
    FicheRNCP: z.string(),
    "Niveau fiche RNCP": z.string().nullable(),
    "Abrégé de diplôme (RNCP)": z.string().nullable(),
    "Dernière MaJ": z.string().nullable(),
    "Accès à l'apprentissage de la fiche RNCP (oui/non)": z.string().nullable(),
    "Date d'échéance de la fiche RNCP": z.string().nullable(),
    "Fiche ACTIVE/INACTIVE": z.string().nullable(),
    "Intitulé certification (RNCP)": z.string().nullable(),
    "Type d'enregistrement": z.string().nullable(),
    "Date de publication de la fiche": z.string().nullable(),
    "Date de décision": z.string().nullable(),
    "Date de début des parcours certifiants": z.string().nullable(),
    "Date limite de la délivrance": z.string().nullable(),
    "Nouvelle Certification rempla (RNCP)": z.string().nullable(),
    "Ancienne Certification (RNCP)": z.string().nullable(),
  })
  .strict();

export const zKitApprentissage = z
  .object({
    _id: zObjectId,
    source: z.string().regex(/^((Kit_apprentissage_\d{8})|(Kit apprentissage et RNCP v\d\.\d))\.csv$/),
    date: z.date(),
    data: zKitApprentissageData,
    version: z.string().regex(/^\d{8}$/),
  })
  .strict();

export const sourceKitApprentissageModelDescriptor = {
  zod: zKitApprentissage,
  indexes,
  collectionName,
};

export type ISourceKitApprentissage = z.output<typeof zKitApprentissage>;
