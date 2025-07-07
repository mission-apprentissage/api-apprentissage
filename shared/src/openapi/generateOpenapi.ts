import { buildOpenApiSchema } from "api-alternance-sdk/internal";

export function generateOpenApiSchema(version: string, env: string, publicUrl: string, lang: "en" | "fr") {
  const builder = buildOpenApiSchema(version, env, publicUrl, lang);

  return builder.getSpec();
}
