import { z } from "zod";

import { extensions } from "../../helpers/zodHelpers/zodPrimitives";
import { IModelDescriptor, zObjectId } from "../common";

const collectionName = "acce.zone" as const;

const indexes: IModelDescriptor["indexes"] = [[{ numero_uai: 1 }, {}]];

export const ZAcceZone = z
  .object({
    _id: zObjectId,
    numero_uai: extensions.uai,
    type_zone_uai: z.string().optional(),
    type_zone_uai_libe: z.string().optional(),
    zone: z.string().optional(),
    zone_libe: z.string().optional(),
    date_ouverture: z.string().optional(),
    date_fermeture: z.string().optional(),
    date_derniere_mise_a_jour: z.string().optional(),
    updated_at: z.date().optional().describe("Date de mise à jour en base de données"),
    created_at: z.date().describe("Date d'ajout en base de données"),
  })
  .strict();

export type IAcceZone = z.output<typeof ZAcceZone>;

export default {
  zod: ZAcceZone,
  indexes,
  collectionName,
};
