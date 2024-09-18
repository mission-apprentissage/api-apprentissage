import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { OpenApiBuilder, ResponsesObject } from "openapi3-ts/oas31";

import {
  zAcceUai,
  zAcceUaiFille,
  zAcceUaiMere,
  zAcceUaiSpec,
  zAcceUaiZone,
} from "../../../models/source/acce/source.acce.model.js";

export function registerAcceExperimentalRoutes(
  builder: OpenApiBuilder,
  errorResponses: ResponsesObject
): OpenApiBuilder {
  const registry = new OpenAPIRegistry();
  registry.register("SourceAcceUai", zAcceUai.shape.data);
  registry.register("SourceAcceUaiZone", zAcceUaiZone.shape.data);
  registry.register("SourceAcceUaiSpec", zAcceUaiSpec.shape.data);
  registry.register("SourceAcceUaiMere", zAcceUaiMere.shape.data);
  registry.register("SourceAcceUaiFille", zAcceUaiFille.shape.data);

  const openApiGenerator = new OpenApiGeneratorV31(registry.definitions);
  const { components } = openApiGenerator.generateComponents();

  if (components?.schemas == null) {
    throw new Error("No schemas found in the generated components");
  }

  Object.entries(components.schemas).map(([name, schema]) => {
    builder.addSchema(name, schema);
  });

  builder.addPath("/experimental/source/acce", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Établissements",
      description: "Liste des établissements importés depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SourceAcceUai",
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });

  builder.addPath("/experimental/source/acce/zone", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Zones d'établissements",
      description:
        "Liste des zones d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SourceAcceUaiZone",
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/experimental/source/acce/specialite", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Spécialités d'établissements",
      description:
        "Liste des spécialités d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SourceAcceUaiSpec",
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/experimental/source/acce/mere", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Établissements mères",
      description:
        "Liste des relations fille-mère d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SourceAcceUaiMere",
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/experimental/source/acce/fille", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Établissements filles",
      description:
        "Liste des relations mère-fille d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/SourceAcceUaiFille",
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });

  return builder;
}
