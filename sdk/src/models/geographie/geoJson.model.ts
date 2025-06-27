import { z } from "zod/v4-mini";

const zLongitude = z
  .number()
  .check(
    z.gte(-180, "Longitude doit être comprise entre -180 et 180"),
    z.lte(180, "Longitude doit être comprise entre -180 et 180")
  );
const zLatitude = z
  .number()
  .check(
    z.gte(-90, "Latitude doit être comprise entre -90 et 90"),
    z.lte(90, "Latitude doit être comprise entre -90 et 90")
  );

const zGeoCoord = z.tuple([zLongitude, zLatitude]);

export const zGeoJsonPoint = z.strictObject({
  coordinates: zGeoCoord,
  type: z.literal("Point"),
});

export const zGeoJsonPolygon = z.strictObject({
  coordinates: z.array(z.array(zGeoCoord)),
  type: z.literal("Polygon"),
});

export const zAdresse = z.object({
  label: z.nullable(z.string()),
  code_postal: z.nullable(z.string()),
  commune: z.object({
    nom: z.string(),
    code_insee: z.string(),
  }),
  departement: z.object({
    nom: z.string(),
    code_insee: z.string(),
  }),
  region: z.object({
    code_insee: z.string(),
    nom: z.string(),
  }),
  academie: z.object({
    id: z.string(),
    code: z.string(),
    nom: z.string(),
  }),
});

export type IGeoJsonPoint = z.infer<typeof zGeoJsonPoint>;
export type IGeoJsonPolygon = z.infer<typeof zGeoJsonPolygon>;
