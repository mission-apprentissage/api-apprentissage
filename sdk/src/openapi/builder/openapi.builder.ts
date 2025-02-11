import type { PathItemObject } from "openapi3-ts/oas31";
import { OpenApiBuilder } from "openapi3-ts/oas31";

import { registerOpenApiErrorsSchema } from "../../models/errors/errors.model.openapi.js";
import { openapiSpec } from "../openapiSpec.js";
import { addOperationDoc, addSchemaDoc, getTextOpenAPI } from "../utils/zodWithOpenApi.js";

export function buildOpenApiSchema(version: string, env: string, publicUrl: string, lang: "en" | "fr"): OpenApiBuilder {
  const builder = new OpenApiBuilder({
    openapi: "3.1.0",
    info: {
      title:
        lang === "fr"
          ? "Documentation technique de l'espace développeurs La bonne alternance"
          : "Developer Space La bonne alternance technical documentation",
      version,
      license: {
        name: "Etalab-2.0",
        url: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
      },
      termsOfService: "https://api.apprentissage.beta.gouv.fr/cgu",
      contact: {
        name:
          lang === "fr"
            ? "Équipe Espace développeurs La bonne alternance"
            : "Espace développeurs La bonne alternance team",
        email: "support_api@apprentissage.beta.gouv.fr",
      },
    },
    servers: [
      {
        url: publicUrl,
        description: env,
      },
    ],
    tags: Object.values(openapiSpec.tags).map(({ name, description }) => ({
      name: getTextOpenAPI(name, lang),
      description: getTextOpenAPI(description, lang),
    })),
  });

  builder.addSecurityScheme("api-key", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "Bearer",
    description:
      lang === "fr"
        ? "Clé d'API à fournir dans le header `Authorization`. Si la route nécessite une habilitation particulière veuillez contacter le support pour en faire la demande à [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr)"
        : "API key to provide in the `Authorization` header. If the route requires a particular authorization, please contact support to request it at [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr)",
  });

  for (const [name, s] of Object.entries(openapiSpec.models)) {
    builder.addSchema(name, addSchemaDoc(s.schema, s.doc, lang, ["models", name]));
  }

  for (const [path, operations] of Object.entries(openapiSpec.routes)) {
    builder.addPath(
      path,
      Object.entries(operations).reduce<PathItemObject>((acc, [method, operation]) => {
        acc[method as "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace"] = addOperationDoc(
          operation,
          lang
        );
        return acc;
      }, {})
    );
  }

  registerOpenApiErrorsSchema(builder, lang);

  return builder;
}
