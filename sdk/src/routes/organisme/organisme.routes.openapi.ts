import { exportOrganismesRouteDoc } from "../../docs/routes/exportOrganismes/exportOrganismes.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const organismeRoutesOpenapi: OpenapiRoutes = {
  "/organisme/v1/recherche": {
    get: {
      tag: "organismes",
      doc: null,
    },
  },
  "/organisme/v1/export": {
    get: {
      tag: "organismes",
      doc: exportOrganismesRouteDoc,
    },
  },
};
