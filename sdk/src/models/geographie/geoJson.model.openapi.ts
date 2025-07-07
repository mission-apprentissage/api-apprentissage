import {
  adresseModelDoc,
  geoJsonPointModelDoc,
  geoJsonPolygonModelDoc,
} from "../../docs/models/geoJson/geoJson.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zAdresse, zGeoJsonPoint, zGeoJsonPolygon } from "./geoJson.model.js";

export const geoJsonPointModelOpenapi: OpenapiModel<"GeoJsonPoint"> = {
  name: "GeoJsonPoint",
  doc: geoJsonPointModelDoc,
  zod: zGeoJsonPoint,
};

export const geoJsonPolygonModelOpenapi: OpenapiModel<"GeoJsonPolygon"> = {
  name: "GeoJsonPolygon",
  doc: geoJsonPolygonModelDoc,
  zod: zGeoJsonPolygon,
};

export const adresseModelOpenapi: OpenapiModel<"Adresse"> = {
  name: "Adresse",
  doc: adresseModelDoc,
  zod: zAdresse,
};
