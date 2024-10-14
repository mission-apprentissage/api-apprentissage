import { zGeoJsonPoint, zGeoJsonPolygon } from "api-alternance-sdk";
import { z } from "zod";

export const sourceGeoRegion = z.object({
  nom: z.string(),
  code: z.string(),
});

export const sourceGeoDepartement = z.object({
  code: z.string(),
  codeRegion: z.string(),
  nom: z.string(),
});

export const sourceGeoCommune = z.object({
  nom: z.string(),
  code: z.string(),
  codesPostaux: z.array(z.string()),
  codeDepartement: z.string(),
  codeRegion: z.string(),
  centre: zGeoJsonPoint,
  bbox: zGeoJsonPolygon,
});

export type ISourceGeoRegion = z.infer<typeof sourceGeoRegion>;
export type ISourceGeoDepartement = z.infer<typeof sourceGeoDepartement>;
export type ISourceGeoCommune = z.infer<typeof sourceGeoCommune>;
