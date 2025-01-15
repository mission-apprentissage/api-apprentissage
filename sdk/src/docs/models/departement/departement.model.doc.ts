import type { DocTechnicalField } from "../../types.js";
import { communeModelDoc } from "../commune/commune.model.doc.js";

export const departementModelDoc = {
  descriptions: [{ en: null, fr: "Département" }],
  properties: {
    ...communeModelDoc.properties.departement.properties,
    region: communeModelDoc.properties.region,
    academie: communeModelDoc.properties.academie,
  },
} as const satisfies DocTechnicalField;
