import { z } from "zod";

import { zGeoJsonPoint, zGeoJsonPolygon } from "./geoJson.model.js";
import { zMissionLocale } from "./mission-locale.model.js";

export const zCommune = z.object({
  nom: z.string(),
  code: z.object({
    insee: z.string(),
    postaux: z.array(z.string()),
  }),
  anciennes: z.array(z.object({ nom: z.string(), codeInsee: z.string() })),
  arrondissements: z.array(
    z.object({
      code: z.string(),
      nom: z.string(),
    })
  ),
  departement: z.object({
    nom: z.string(),
    codeInsee: z.string(),
  }),
  region: z.object({
    codeInsee: z.string(),
    nom: z.string(),
  }),
  academie: z.object({
    id: z.string(),
    code: z.string(),
    nom: z.string(),
  }),
  localisation: z.object({
    centre: zGeoJsonPoint,
    bbox: zGeoJsonPolygon,
  }),
  mission_locale: zMissionLocale.nullable(),
});

export type ICommune = z.infer<typeof zCommune>;
