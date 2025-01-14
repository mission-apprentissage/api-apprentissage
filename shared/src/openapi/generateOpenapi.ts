import { buildOpenApiSchema } from "api-alternance-sdk/internal";

import { registerHealhcheckRoutes } from "../routes/healthcheck.routes.js";

export function generateOpenApiSchema(version: string, env: string, publicUrl: string, lang: "en" | "fr") {
  const builder = buildOpenApiSchema(version, env, publicUrl, lang);

  registerHealhcheckRoutes(builder, lang);

  return builder.getSpec();
}
