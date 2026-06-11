import { registry } from "zod/v4-mini";
import type { PathItemObject, SchemaObject } from "openapi3-ts/oas31";
import { OpenApiBuilder } from "openapi3-ts/oas31";
import { zParisLocalDate } from "../../utils/date.primitives.js";
import { zSiret, zUai } from "../../models/organisme/organismes.primitives.js";
import { zTransformNullIfEmptyString } from "../../models/primitives/primitives.model.js";
import { registerOpenApiErrorsSchema } from "../../models/errors/errors.model.openapi.js";
import { openapiSpec } from "../openapiSpec.js";
import { addOperationDoc, addSchemaDoc, getTextOpenAPI } from "../utils/zodWithOpenApi.js";
import type { IApiRoutesDef } from "../../routes/index.js";
import { zApiRoutes } from "../../routes/index.js";
import { generateComponents, generateOpenApiOperationObjectFromZod } from "../utils/openapi.uils.js";

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

function getApiDescription(lang: "en" | "fr" | null): string {
  switch (lang) {
    case "fr":
      return `# Limites de débit (rate limiting)

Pour garantir la disponibilité du service à l'ensemble des consommateurs, chaque endpoint est soumis à une limite d'appels **par consommateur** (clé d'API). Les limites précises sont indiquées dans la description de chaque endpoint.

## Headers renvoyés

Chaque réponse inclut des headers indiquant l'état de votre quota :

| Header | Description |
|---|---|
| \`x-ratelimit-limit\` | Nombre d'appels autorisés sur la fenêtre courante |
| \`x-ratelimit-remaining\` | Nombre d'appels encore disponibles |
| \`x-ratelimit-reset\` | Nombre de secondes avant remise à zéro du compteur |
| \`retry-after\` | (Sur 429 uniquement) Secondes à attendre avant de réessayer |

## En cas de dépassement

Lorsque votre quota est atteint, l'API renvoie un code **HTTP 429 — Too Many Requests** avec un corps JSON décrivant la limite franchie. Patientez la durée indiquée par le header \`retry-after\` avant de réémettre la requête.

## Bonnes pratiques

- Surveillez les headers \`x-ratelimit-remaining\` pour anticiper l'atteinte des limites.
- Implémentez un mécanisme de retry avec backoff exponentiel respectant le \`retry-after\`.
- Si vos volumes nécessitent des limites supérieures, contactez [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr).`;
    case "en":
      return `# Rate limiting

To ensure service availability for all consumers, each endpoint enforces a per-consumer (API key) call limit. Specific limits are documented in each endpoint's description.

## Returned headers

Every response includes headers reporting your quota state:

| Header | Description |
|---|---|
| \`x-ratelimit-limit\` | Number of calls allowed within the current window |
| \`x-ratelimit-remaining\` | Number of calls still available |
| \`x-ratelimit-reset\` | Seconds until the counter resets |
| \`retry-after\` | (On 429 only) Seconds to wait before retrying |

## When the quota is exceeded

Once your quota is reached, the API responds with **HTTP 429 — Too Many Requests** and a JSON body describing the breached limit. Wait the duration provided in the \`retry-after\` header before retrying.

## Best practices

- Monitor \`x-ratelimit-remaining\` to anticipate hitting the limits.
- Implement retries with exponential backoff that honor \`retry-after\`.
- If your volume requires higher limits, contact [support_api@apprentissage.beta.gouv.fr](mailto:support_api@apprentissage.beta.gouv.fr).`;
    default:
      return "";
  }
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
    zodRegistry.add(model.zod, {
      id: `#/components/schemas/${model.name}`,
    });
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
      description: getApiDescription(lang),
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
      addSchemaDoc("schema" in s ? s.schema : components.schemas[`#/components/schemas/${name}`], s.doc, lang, [
        "models",
        name,
      ])
    );
  }

  for (const [path, operations] of Object.entries(openapiSpec.routes)) {
    builder.addPath(
      path.replaceAll(/:([^:/]+)/g, "{$1}"), // Replace :param with {param} for OpenAPI
      Object.entries(operations).reduce<PathItemObject>((acc, [method, operation]) => {
        const r: IApiRoutesDef = zApiRoutes;
        const m = method as "get" | "put" | "post" | "delete";
        acc[m] = addOperationDoc(
          operation,
          operation.schema ??
            generateOpenApiOperationObjectFromZod(r?.[m]?.[path], zodRegistry, path, method, operation.tag),
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
      },
      generateOpenApiOperationObjectFromZod(
        zApiRoutes.get["/healthcheck"],
        zodRegistry,
        "/healthcheck",
        "get",
        "system"
      ),
      lang
    ),
  });

  registerOpenApiErrorsSchema(builder, lang);

  return builder;
}
