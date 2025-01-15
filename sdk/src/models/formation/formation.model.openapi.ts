import type { OpenApiBuilder } from "openapi3-ts/oas31";

export function registerOpenApiFormationSchema(builder: OpenApiBuilder, _lang: "en" | "fr"): OpenApiBuilder {
  return builder;
  // return builder.addSchema("Formation", addSchemaDoc(schema, formationModelDoc, lang));
}
