import type { DocModel } from "../../types.js";
import { communeModelDoc } from "../commune/commune.model.doc.js";

export const departementModelDoc = {
  description: { en: null, fr: "Département" },
  _: {
    ...communeModelDoc._.departement._,
    region: communeModelDoc._.region,
    academie: communeModelDoc._.academie,
  },
} as const satisfies DocModel;
