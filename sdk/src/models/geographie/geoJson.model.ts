import { z } from "zod";

const zLongitude = z
  .number()
  .min(-180, "Longitude doit être comprise entre -180 et 180")
  .max(180, "Longitude doit être comprise entre -180 et 180");
const zLatitude = z
  .number()
  .min(-90, "Latitude doit être comprise entre -90 et 90")
  .max(90, "Latitude doit être comprise entre -90 et 90");

const zGeoCoord = z.tuple([zLongitude, zLatitude]);

export const zGeoJsonPoint = z
  .object({
    coordinates: zGeoCoord,
    type: z.literal("Point"),
  })
  .strict()
  .openapi("GeoJsonPoint");

export const zGeoJsonPolygon = z
  .object({
    coordinates: z.array(z.array(zGeoCoord)),
    type: z.literal("Polygon"),
  })
  .strict()
  .openapi("GeoJsonPolygon");

export const zAdresse = z
  .object({
    label: z.string().nullable(),
    code_postal: z.string().nullable(),
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
  })
  .openapi("Adresse");

export type IGeoJsonPoint = z.infer<typeof zGeoJsonPoint>;
export type IGeoJsonPolygon = z.infer<typeof zGeoJsonPolygon>;
