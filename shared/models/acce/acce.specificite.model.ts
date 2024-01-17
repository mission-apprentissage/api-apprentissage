import { z } from "zod";

import { extensions } from "../../helpers/zodHelpers/zodPrimitives";
import { IModelDescriptor, zObjectId } from "../common";

const collectionName = "acce.specificite" as const;

const indexes: IModelDescriptor["indexes"] = [[{ numero_uai: 1 }, {}]];

export const ZAcceSpecificite = z
  .object({
    _id: zObjectId,
    numero_uai: extensions.uai,
    specificite_uai: z.string().optional(),
    specificite_uai_libe: z.string().optional(),
    date_ouverture: z.string().optional(),
    date_fermeture: z.string().optional(),
    updated_at: z.date().optional().describe("Date de mise à jour en base de données"),
    created_at: z.date().describe("Date d'ajout en base de données"),
  })
  .strict();

export type IAcceSpecificite = z.output<typeof ZAcceSpecificite>;

export default {
  zod: ZAcceSpecificite,
  indexes,
  collectionName,
};
