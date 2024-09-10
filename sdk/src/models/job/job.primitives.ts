import { z } from "zod";

import { zNiveauDiplomeEuropeen } from "../certification/certification.primitives.js";

function addLongitudeConstraint(base: z.ZodNumber) {
  return base
    .min(-180, "Longitude doit être comprise entre -180 et 180")
    .max(180, "Longitude doit être comprise entre -180 et 180");
}

function addLatitudeConstraint(base: z.ZodNumber) {
  return base
    .min(-90, "Latitude doit être comprise entre -90 et 90")
    .max(90, "Latitude doit être comprise entre -90 et 90");
}

export const zLongitude = addLongitudeConstraint(z.number());

export const zLongitudeCoerce = addLongitudeConstraint(z.coerce.number());

export const zLatitude = addLatitudeConstraint(z.number());

export const zLatitudeCoerce = addLatitudeConstraint(z.coerce.number());

export const zGeopoint = z.object({
  coordinates: z.tuple([zLongitude.describe("Longitude"), zLatitude.describe("Latitude")]),
  type: z.literal("Point"),
});

export const zOfferTargetDiplomaLevel = zNiveauDiplomeEuropeen.exclude(["1", "2", "8"]);
