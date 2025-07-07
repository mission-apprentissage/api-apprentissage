import { getCertificationsRouteDoc } from "../../docs/routes/getCertifications/getCertifications.route.doc.js";
import type { OpenapiRoutes } from "../../openapi/types.js";

export const certificationsRoutesOpenapi: OpenapiRoutes = {
  "/certification/v1": {
    get: {
      tag: "certifications",
      doc: getCertificationsRouteDoc,
    },
  },
};
