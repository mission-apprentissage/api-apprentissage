import { exportOrganismesRouteDoc } from "../../docs/routes/exportOrganismes/exportOrganismes.route.doc.js";
import { searchOrganismeRouteDoc } from "../../docs/routes/searchOrganisme/searchOrganisme.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const organismeRoutesOpenapi: OpenapiRoutes = {
  "/organisme/v1/recherche": {
    get: {
      tag: "organismes",
      doc: searchOrganismeRouteDoc,
    },
  },
  "/organisme/v1/export": {
    get: {
      tag: "organismes",
      doc: exportOrganismesRouteDoc,
    },
  },
};
