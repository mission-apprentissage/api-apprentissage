import { registry, toJSONSchema } from "zod/v4-mini";
import type { $ZodRegistry, $ZodType, JSONSchema } from "zod/v4/core";
import type { PathItemObject, SchemaObject } from "openapi3-ts/oas31";
import { OpenApiBuilder } from "openapi3-ts/oas31";
import { zParisLocalDate } from "../../utils/date.primitives.js";
import { zSiret, zUai } from "../../models/organisme/organismes.primitives.js";
import { zTransformNullIfEmptyString } from "../../models/primitives/primitives.model.js";

import { registerOpenApiErrorsSchema } from "../../models/errors/errors.model.openapi.js";
import { openapiSpec } from "../openapiSpec.js";
import { addOperationDoc, addSchemaDoc, getTextOpenAPI } from "../utils/zodWithOpenApi.js";
import { zApiRoutes } from "../../routes/index.js";
import { generateOpenApiOperationObjectFromZod } from "../utils/openapi.uils.js";

type RegistryMeta = { id?: string | undefined; openapi?: Partial<SchemaObject> };

function getTitle(lang: "en" | "fr" | null): string {
  switch (lang) {
    case "fr":
      return "Documentation technique";
    case "en":
      return "Technical documentation";
    default:
      return "";
  }
}

function getContactName(lang: "en" | "fr" | null): string {
  switch (lang) {
    case "fr":
      return "Équipe Espace développeurs La bonne alternance";
    case "en":
      return "The 'La bonne alternance' developer space team";
    default:
      return "";
  }
}

function getSecuritySchemeDescription(lang: "en" | "fr" | null): string {
  switch (lang) {
    case "fr":
      return "Clé d'API à fournir dans le header `Authorization`. Si la route nécessite une habilitation particulière veuillez contacter le support pour en faire la demande à [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr)";
    case "en":
      return "API key to provide in the `Authorization` header. If the route requires a particular authorization, please contact support to request it at [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr)";
    default:
      return "";
  }
}

function generateComponents(registry: $ZodRegistry<RegistryMeta>, io: "input" | "output") {
  return toJSONSchema(registry, {
    unrepresentable: "any",
    uri: (id: string) => id,
    io,
    override: (ctx: { zodSchema: $ZodType; jsonSchema: JSONSchema.BaseSchema }): void => {
      const meta = registry.get(ctx.zodSchema);
      if (meta?.openapi) {
        Object.assign(ctx.jsonSchema, meta?.openapi);
      }

      if ("maximum" in ctx.jsonSchema && ctx.jsonSchema.maximum === Number.MAX_SAFE_INTEGER) {
        delete ctx.jsonSchema.maximum;
      }

      if ("minimum" in ctx.jsonSchema && ctx.jsonSchema.minimum === Number.MIN_SAFE_INTEGER) {
        delete ctx.jsonSchema.minimum;
      }
    },
  });
}

// Using the lang null is mainly used for testing purposes, it allows to generate the OpenAPI spec without text
// The text can be changed anytime, so it is useful to test the OpenAPI generation without worrying about the text
export function buildOpenApiSchema(
  version: string,
  env: string,
  publicUrl: string,
  lang: "en" | "fr" | null
): OpenApiBuilder {
  const zodRegistry = registry<RegistryMeta>();

  for (const [, model] of Object.entries(openapiSpec.models)) {
    if (model.zod !== null) {
      zodRegistry.add(model.zod, {
        id: `#/components/schemas/${model.name}`,
      });
    }
  }

  zodRegistry.add(zParisLocalDate, { openapi: { type: "string", format: "date-time" } });
  zodRegistry.add(zTransformNullIfEmptyString, {
    openapi: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
  });
  zodRegistry.add(zSiret, { openapi: { type: "string", pattern: "^\\d{14}$" } });
  zodRegistry.add(zUai, { openapi: { type: "string", pattern: "^\\d{7}[A-Z]$" } });

  const components = generateComponents(zodRegistry, "output");

  const builder = new OpenApiBuilder({
    openapi: "3.1.0",
    info: {
      title: getTitle(lang),
      version,
      license: {
        name: "Etalab-2.0",
        url: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
      },
      termsOfService: "https://api.apprentissage.beta.gouv.fr/cgu",
      contact: {
        name: getContactName(lang),
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
      name: getTextOpenAPI(name, lang ?? "en"), // Exception: keep tags
      description: getTextOpenAPI(description, lang),
    })),
  });

  builder.addSecurityScheme("api-key", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "Bearer",
    description: getSecuritySchemeDescription(lang),
  });

  for (const [name, s] of Object.entries(openapiSpec.models)) {
    builder.addSchema(
      name,
      addSchemaDoc(s.schema ?? components.schemas[`#/components/schemas/${name}`], s.doc, lang, ["models", name])
    );
  }

  for (const [path, operations] of Object.entries(openapiSpec.routes)) {
    builder.addPath(
      path.replaceAll(/:([^:/]+)/g, "{$1}"), // Replace :param with {param} for OpenAPI
      Object.entries(operations).reduce<PathItemObject>((acc, [method, operation]) => {
        acc[method as "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace"] = addOperationDoc(
          {
            ...operation,
            schema:
              operation.schema ??
              generateOpenApiOperationObjectFromZod(zApiRoutes[method][path], zodRegistry, path, method, operation.tag),
          },
          lang
        );
        return acc;
      }, {})
    );
  }

  builder.addPath("/healthcheck", {
    get: addOperationDoc(
      {
        tag: "system",
        doc: null,
        schema: generateOpenApiOperationObjectFromZod(
          zApiRoutes.get["/healthcheck"],
          zodRegistry,
          "/healthcheck",
          "get",
          "system"
        ),
      },
      lang
    ),
  });

  registerOpenApiErrorsSchema(builder, lang);

  return builder;
}
