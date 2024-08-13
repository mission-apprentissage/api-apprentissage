import { DateTime } from "luxon";
import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from '../../common.js';

const collectionName = "source.kali.ccn" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date_import: 1 }, {}],
  [{ "data.type": 1, "data.idcc": 1, "data.titre": 1 }, {}],
];

const zEtat = z.enum([
  "ABROGE",
  "DENONCE",
  "MODIFIE",
  "PERIME",
  "REMPLACE",
  "VIGUEUR",
  "VIGUEUR_ETEN",
  "VIGUEUR_NON_ETEN",
]);

const zDate = z.date().transform((val) => {
  return DateTime.fromJSDate(val, { zone: "UTC" }).setZone("Europe/Paris", { keepLocalTime: true }).toJSDate();
});

export const zSourceKaliConventionCollectionData = z.object({
  type: z.literal("IDCC"),
  id: z.string(),
  idcc: z.coerce.number(),
  titre: z.string(),
  nature: z.enum([
    "ACCORD COLLECTIF NATIONAL",
    "AVENANT",
    "CONVENTION",
    "CONVENTION COLLECTIVE",
    "CONVENTION COLLECTIVE DEPARTEMENTALE",
    "CONVENTION COLLECTIVE NATIONALE",
    "CONVENTION COLLECTIVE INTERREGIONALE",
    "CONVENTION COLLECTIVE REGIONALE",
  ]),
  etat: zEtat,
  debut: zDate,
  fin: zDate.nullable(),
  url: z.string().url(),
});

export const zSourceKaliTextIndependentData = z.object({
  type: z.literal("TI"),
  id: z.string(),
  titre: z.string(),
  nature: z.enum([
    "ACCORD INTERBRANCHE",
    "ACCORD COLLECTIF NATIONAL",
    "ACCORD DE BRANCHE",
    "AVENANT",
    "ACCORD NATIONAL INTERPROFESSIONNEL",
    "ACCORD DE METHODE",
    "ACCORD PARITAIRE",
    "ACCORD CADRE INTERSECTEURS",
    "ACCORD REGIONAL",
    "ACCORD PROFESSIONNEL",
    "ANNEXE",
    "ACCORD NATIONAL INTERBRANCHES",
    "PROCES-VERBAL",
    "CONVENTION COLLECTIVE NATIONALE",
    "ACCORD-CADRE",
    "ACCORD COLLECTIF",
    "ACCORD NATIONAL PLURIPROFESSIONNEL",
    "PROTOCOLE D'ACCORD INTERBRANCHE",
    "ACCORD MULTIBRANCHES",
    "PROTOCOLE D'ACCORD",
    "ACCORD PARITAIRE NATIONAL",
    "ACCORD PROFESSIONNEL INTER-SECTEURS",
    "CONVENTION COLLECTIVE DEPARTEMENTALE",
    "CONVENTION COLLECTIVE INTERREGIONALE",
    "CONVENTION",
    "CONVENTION COLLECTIVE REGIONALE",
    "ACCORD NATIONAL PROFESSIONNEL",
    "CONVENTION COLLECTIVE",
    "ACCORD INTERPROFESSIONNEL",
    "ACCORD INTERSECTEURS",
    "ACCORD INTERBRANCHES",
    "ACCORD PLURIPROFESSIONNEL",
    "ACCORD NATIONAL",
    "ACCORD NATIONAL COLLECTIF",
    "PROTOCOLE D'ACCORD NATIONAL",
    "ACCORD",
    "DECISION",
    "ACCORD DE SUBSTITUTION",
  ]),
  etat: zEtat,
  debut: zDate,
  fin: zDate.nullable(),
  url: z.string().url(),
});

export const zSourceKaliCcn = z.object({
  _id: zObjectId,
  date_import: z.date(),
  data: z.discriminatedUnion("type", [zSourceKaliConventionCollectionData, zSourceKaliTextIndependentData]),
});

export const sourceKaliCcnModelDescriptor = {
  zod: zSourceKaliCcn,
  indexes,
  collectionName,
};

export type ISourceKaliCcn = z.output<typeof zSourceKaliCcn>;
