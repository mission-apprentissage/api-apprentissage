import { zApiFormationRoutes } from "api-alternance-sdk";
import type { OpenApiBuilder } from "openapi3-ts/oas31";

import type { IRoutesDef } from "./common.routes.js";

export const zFormationRoutes = {
  get: {
    "/formation/v1/search": {
      ...zApiFormationRoutes.get["/formation/v1/search"],
      securityScheme: {
        auth: "api-key",
        access: null,
        ressources: {},
      },
    },
  },
} as const satisfies IRoutesDef;

export function registerFormationRoutes(builder: OpenApiBuilder, _lang: "en" | "fr"): OpenApiBuilder {
  return builder;
}
