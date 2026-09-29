import type { PathItemObject, SchemaObject } from "openapi3-ts/oas31"
import { OpenApiBuilder } from "openapi3-ts/oas31"
import { registry } from "zod/v4-mini"
import { registerOpenApiErrorsSchema } from "../../models/errors/errors.model.openapi.js"
import { zSiret, zUai } from "../../models/organisme/organismes.primitives.js"
import { zTransformNullIfEmptyString } from "../../models/primitives/primitives.model.js"
import type { IApiRouteSchema } from "../../routes/common.routes.js"
import type { IApiRoutesDef } from "../../routes/index.js"
import { zApiRoutes } from "../../routes/index.js"
import { CONTACT_EMAIL } from "../../utils/contact.js"
import { zParisLocalDate } from "../../utils/date.primitives.js"
import { accesHabilitationsSectionOpenapi, demandeHabilitationsOpenapi } from "../habilitations.openapi.js"
import { openapiSpec } from "../openapiSpec.js"
import type { OpenapiHabilitation } from "../types.js"
import { generateComponents, generateOpenApiOperationObjectFromZod } from "../utils/openapi.uils.js"
import { addOperationDoc, addSchemaDoc, getTextOpenAPI } from "../utils/zodWithOpenApi.js"

type RegistryMeta = { id?: string | undefined; openapi?: Partial<SchemaObject> }

function getTitle(lang: "en" | "fr" | null): string {
  switch (lang) {
    case "fr":
      return "Documentation technique"
    case "en":
      return "Technical documentation"
    default:
      return ""
  }
}

function getContactName(lang: "en" | "fr" | null): string {
  switch (lang) {
    case "fr":
      return "Équipe Espace développeurs La bonne alternance"
    case "en":
      return "The 'La bonne alternance' developer space team"
    default:
      return ""
  }
}

function getSecuritySchemeDescription(lang: "en" | "fr" | null): string {
  const { title, anchor } = accesHabilitationsSectionOpenapi

  switch (lang) {
    case "fr":
      return `Clé d'API à fournir dans le header \`Authorization\`, précédée de \`Bearer \` : \`Authorization: Bearer <votre clé d'API>\`. Seules les routes listées dans [${title.fr}](#${anchor.fr}) exigent une habilitation.`
    case "en":
      return `API key to provide in the \`Authorization\` header, prefixed with \`Bearer \`: \`Authorization: Bearer <your API key>\`. Only the routes listed in [${title.en}](#${anchor.en}) require a habilitation.`
    default:
      return ""
  }
}

// Routes exigeant l'habilitation, dérivées du securityScheme : la même source que l'autorisation
// appliquée à l'exécution, pour que le tableau de l'intro ne puisse pas diverger
function getHabilitationRoutes(habilitation: OpenapiHabilitation): string {
  return Object.values(zApiRoutes)
    .flatMap((routes) => Object.values(routes) as IApiRouteSchema[])
    .filter((route) => route.securityScheme?.access === habilitation)
    .map((route) => `\`${route.method.toUpperCase()} ${route.path.replaceAll(/:([^:/]+)/g, "{$1}")}\``)
    .join(", ")
}

function getHabilitationsTable(lang: "en" | "fr"): string {
  const habilitations = Object.keys(demandeHabilitationsOpenapi) as OpenapiHabilitation[]
  const header = lang === "fr" ? "| Habilitation | Usage | Routes |\n|---|---|---|" : "| Habilitation | Use | Routes |\n|---|---|---|"
  const rows = habilitations.map((habilitation) => `| \`${habilitation}\` | ${demandeHabilitationsOpenapi[habilitation].label[lang]} | ${getHabilitationRoutes(habilitation)} |`)
  const restrictions = habilitations.flatMap((habilitation) => {
    const { restriction } = demandeHabilitationsOpenapi[habilitation]
    return restriction ? [`\`${habilitation}\`${lang === "fr" ? " : " : ": "}${restriction[lang]}`] : []
  })

  return [[header, ...rows].join("\n"), ...restrictions].join("\n\n")
}

function getApiDescription(lang: "en" | "fr" | null, siteUrl: string): string {
  const { title } = accesHabilitationsSectionOpenapi

  switch (lang) {
    case "fr":
      return `# Authentification

Chaque appel porte votre clé d'API dans le header \`Authorization\`, précédée de \`Bearer \` (avec un espace). La clé se crée sur [votre compte](${siteUrl}/compte/profil).

\`\`\`bash
curl -H "Authorization: Bearer <votre clé d'API>" "https://api.apprentissage.beta.gouv.fr/api/formation/v1/search"
\`\`\`

Sans header, sans le préfixe \`Bearer \`, ou avec une clé invalide, expirée ou révoquée, l'API répond **401**. Une clé valide sans l'habilitation exigée par la route reçoit **403**.

# ${title.fr}

**Consulter les données ne demande aucune habilitation** : offres d'emploi, formations, certifications, organismes et référentiel géographique sont accessibles avec toute clé d'API valide.

Seules les routes suivantes exigent une habilitation :

${getHabilitationsTable("fr")}

Les habilitations sont accordées à une **organisation**, pas à une clé : une habilitation accordée s'applique immédiatement à toutes les clés production des comptes rattachés à l'organisation, sans avoir à en recréer. Pour en faire la demande, écrivez à [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) en précisant votre organisation et l'usage visé.

Une clé sandbox reçoit d'office ces habilitations pour développer sans attendre : voir la section suivante.

# Environnements : production et sandbox

L'environnement est porté par le **type de votre clé d'API** (choisi à la création, sur [votre compte](${siteUrl}/compte/profil)), pas par l'URL : dans les deux cas, ciblez \`https://api.apprentissage.beta.gouv.fr/api\`.

| | Clé **production** | Clé **sandbox** |
|---|---|---|
| Habilitations | Celles de votre organisation | Accordées d'office, hors restrictions ci-dessus |
| Échanges avec La bonne alternance : recherche, détail et export d'offres, dépôt d'offres, candidatures, rendez-vous | Production | Environnement de test |
| Autres données (certifications, formations, organismes, géographie) | Production | Identiques à la production |

Avec une clé sandbox, toutes vos requêtes vers La bonne alternance, **lectures comprises**, sont routées vers son environnement de recette ([labonnealternance-recette.apprentissage.beta.gouv.fr](https://labonnealternance-recette.apprentissage.beta.gouv.fr)) et non vers sa production : la recherche d'offres interroge les données de recette, distinctes de celles de la production, et rien de ce que vous envoyez n'est visible par de vrais candidats ou employeurs.

Quelle clé choisir :

- vous consultez uniquement des données : créez directement une clé production ;
- vous déposez des offres ou envoyez des candidatures : développez avec une clé sandbox, puis passez sur une clé production une fois l'habilitation accordée à votre organisation.

# Limites de débit (rate limiting)

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
- Si vos volumes nécessitent des limites supérieures, contactez [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`
    case "en":
      return `# Authentication

Every call carries your API key in the \`Authorization\` header, prefixed with \`Bearer \` (with a space). Create the key on [your account](${siteUrl}/compte/profil).

\`\`\`bash
curl -H "Authorization: Bearer <your API key>" "https://api.apprentissage.beta.gouv.fr/api/formation/v1/search"
\`\`\`

Without the header, without the \`Bearer \` prefix, or with an invalid, expired or revoked key, the API responds **401**. A valid key lacking the habilitation required by the route gets **403**.

# ${title.en}

**Reading data requires no habilitation**: job offers, trainings, certifications, organisations and the geographical referential are available with any valid API key.

Only the following routes require a habilitation:

${getHabilitationsTable("en")}

Habilitations are granted to an **organisation**, not to a key: once granted, a habilitation applies immediately to every production key of the accounts attached to the organisation, with no need to create a new one. To request one, write to [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) stating your organisation and intended use.

A sandbox key is granted these habilitations automatically so you can build without waiting: see the next section.

# Environments: production and sandbox

The environment is carried by the **type of your API key** (chosen at creation, on [your account](${siteUrl}/compte/profil)), not by the URL: in both cases, target \`https://api.apprentissage.beta.gouv.fr/api\`.

| | **Production** key | **Sandbox** key |
|---|---|---|
| Habilitations | Your organisation's | Granted automatically, except for the restrictions above |
| La bonne alternance exchanges: job search, details and export, job posting, applications, appointments | Production | Test environment |
| Other data (certifications, trainings, organisations, geography) | Production | Identical to production |

With a sandbox key, all your requests to La bonne alternance, **reads included**, are routed to its staging environment ([labonnealternance-recette.apprentissage.beta.gouv.fr](https://labonnealternance-recette.apprentissage.beta.gouv.fr)) rather than its production: job search queries the staging data, which differs from production, and nothing you send is visible to real candidates or employers.

Which key to choose:

- you only read data: create a production key right away;
- you post job offers or send applications: build with a sandbox key, then switch to a production key once your organisation has been granted the habilitation.

# Rate limiting

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
- If your volume requires higher limits, contact [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`
    default:
      return ""
  }
}

// Using the lang null is mainly used for testing purposes, it allows to generate the OpenAPI spec without text
// The text can be changed anytime, so it is useful to test the OpenAPI generation without worrying about the text
export function buildOpenApiSchema(version: string, env: string, publicUrl: string, lang: "en" | "fr" | null): OpenApiBuilder {
  const zodRegistry = registry<RegistryMeta>()

  for (const [, model] of Object.entries(openapiSpec.models)) {
    zodRegistry.add(model.zod, {
      id: `#/components/schemas/${model.name}`,
    })
  }

  zodRegistry.add(zParisLocalDate, { openapi: { type: "string", format: "date-time" } })
  zodRegistry.add(zTransformNullIfEmptyString, {
    openapi: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
  })
  zodRegistry.add(zSiret, { openapi: { type: "string", pattern: "^\\d{14}$" } })
  zodRegistry.add(zUai, { openapi: { type: "string", pattern: "^\\d{7}[A-Z]$" } })

  const components = generateComponents(zodRegistry, "output")

  const builder = new OpenApiBuilder({
    openapi: "3.1.0",
    info: {
      title: getTitle(lang),
      version,
      // publicUrl est la base de l'API (suffixée /api) ; le site (compte, doc) vit à la racine
      description: getApiDescription(lang, publicUrl.replace(/\/api$/, "")),
      license: {
        name: "Etalab-2.0",
        url: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
      },
      termsOfService: "https://api.apprentissage.beta.gouv.fr/cgu",
      contact: {
        name: getContactName(lang),
        email: CONTACT_EMAIL,
      },
    },
    // Une seule entrée : l'environnement (production/sandbox) est porté par le type de la clé API,
    // pas par l'hôte. Le choix est documenté dans l'intro (section Environnements) et le security
    // scheme ; le sélecteur de server est masqué côté UI pour éviter toute confusion.
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
  })

  builder.addSecurityScheme("api-key", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "Bearer",
    description: getSecuritySchemeDescription(lang),
  })

  for (const [name, s] of Object.entries(openapiSpec.models)) {
    builder.addSchema(name, addSchemaDoc("schema" in s ? s.schema : components.schemas[`#/components/schemas/${name}`], s.doc, lang, ["models", name]))
  }

  for (const [path, operations] of Object.entries(openapiSpec.routes)) {
    builder.addPath(
      path.replaceAll(/:([^:/]+)/g, "{$1}"), // Replace :param with {param} for OpenAPI
      Object.entries(operations).reduce<PathItemObject>((acc, [method, operation]) => {
        const r: IApiRoutesDef = zApiRoutes
        const m = method as "get" | "put" | "post" | "delete"
        acc[m] = addOperationDoc(operation, operation.schema ?? generateOpenApiOperationObjectFromZod(r?.[m]?.[path], zodRegistry, path, method, operation.tag), lang)
        return acc
      }, {})
    )
  }

  builder.addPath("/healthcheck", {
    get: addOperationDoc(
      {
        tag: "system",
        doc: null,
      },
      generateOpenApiOperationObjectFromZod(zApiRoutes.get["/healthcheck"], zodRegistry, "/healthcheck", "get", "system"),
      lang
    ),
  })

  registerOpenApiErrorsSchema(builder, lang)

  return builder
}
