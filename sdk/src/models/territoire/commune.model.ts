import { z } from "zod";

import { zDepartement } from "./departement.model.js";
import { zGeoJsonPoint, zGeoJsonPolygon } from "./geoJson.model.js";

export const zCommune = z.object({
  nom: z.string(),
  codeInsee: z.string(),
  codesPostaux: z.array(z.string()),
  departement: zDepartement,
  centre: zGeoJsonPoint,
  bbox: zGeoJsonPolygon,
});

export type ICommune = z.infer<typeof zCommune>;
