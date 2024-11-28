import { z } from "zod";

import { zGeoJsonPoint, zGeoJsonPolygon } from "./geoJson.model.js";

export const zCommune = z.object({
  nom: z.string(),
  code: z.object({
    insee: z.string(),
    postaux: z.array(z.string()),
  }),
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
  mission_locale: z
    .object({
      id: z.number(),
      nom: z.string(),
      siret: z.string(),
      localisation: z.object({
        geopoint: zGeoJsonPoint.nullable(),
        adresse: z.string(),
        cp: z.string(),
        ville: z.string(),
      }),
      contact: z.object({
        email: z.string().email().nullable(),
        telephone: z.string().nullable(),
        siteWeb: z.string().nullable(),
      }),
    })
    .nullable(),
});

export type ICommune = z.infer<typeof zCommune>;
