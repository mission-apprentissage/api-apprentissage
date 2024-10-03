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
  .strict();

export const zGeoJsonPolygon = z.object({
  coordinates: z.array(z.array(zGeoCoord)),
  type: z.literal("Polygon"),
});

export type IGeoJsonPoint = z.infer<typeof zGeoJsonPoint>;
export type IGeoJsonPolygon = z.infer<typeof zGeoJsonPolygon>;
