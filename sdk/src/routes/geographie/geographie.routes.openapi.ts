import { communeSearchRouteDoc } from "../../docs/routes/communeSearch/communeSearch.route.doc.js";
import { listDepartementsRouteDoc } from "../../docs/routes/listDepartements/listDepartements.route.doc.js";
import { listMissionLocalesRouteDoc } from "../../docs/routes/listMissionLocales/listMissionLocales.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const geographieRoutesOpenapi: OpenapiRoutes = {
  "/geographie/v1/commune/search": {
    get: {
      tag: "geographie",
      doc: communeSearchRouteDoc,
    },
  },
  "/geographie/v1/departement": {
    get: {
      tag: "geographie",
      doc: listDepartementsRouteDoc,
    },
  },
  "/geographie/v1/mission-locale": {
    get: {
      tag: "geographie",
      doc: listMissionLocalesRouteDoc,
    },
  },
};
