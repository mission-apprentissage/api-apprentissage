import { z } from "zod";

import { zodOpenApi } from "../../openapi/utils/zodWithOpenApi.js";
import { zGeoJsonPoint } from "./geoJson.model.js";

export const zMissionLocale = zodOpenApi
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
  .openapi("MissionLocale");

export type IMissionLocale = z.infer<typeof zMissionLocale>;
