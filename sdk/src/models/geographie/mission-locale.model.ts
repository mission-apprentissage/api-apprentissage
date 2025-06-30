import { z } from "zod/v4-mini";
import { zGeoJsonPoint } from "./geoJson.model.js";

export const zMissionLocale = z.object({
  id: z.number(),
  code: z.string(),
  nom: z.string(),
  siret: z.string(),
  localisation: z.object({
    geopoint: z.nullable(zGeoJsonPoint),
    adresse: z.string(),
    cp: z.string(),
    ville: z.string(),
  }),
  contact: z.object({
    email: z.nullable(z.string().check(z.email())),
    telephone: z.nullable(z.string()),
    siteWeb: z.nullable(z.string()),
  }),
});

export type IMissionLocale = z.infer<typeof zMissionLocale>;
