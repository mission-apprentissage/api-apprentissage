import type { DocRoute } from "../../types.js";
import latitude from "./parameters/latitude.md.js";
import longitude from "./parameters/longitude.md.js";
import radius from "./parameters/radius.md.js";
import rncp from "./parameters/rncp.md.js";
import romes from "./parameters/romes.md.js";
import target_diploma_level from "./parameters/target_diploma_level.md.js";
import jobs from "./response/jobs.md.js";
import recruiters from "./response/recruiters.md.js";
import warnings from "./response/warnings.md.js";

export const jobSearchRouteDoc = {
  summary: {
    en: "Search for apprenticeship job opportunities",
    fr: "Recherche d'opportunités d'emploi en apprentissage",
  },
  description: {
    en: "Access in real-time all apprenticeship job opportunities available in France and offer them to your users for free and under a white-label format.",
    fr: "Accédez en temps réel à toutes les opportunités d'emploi en apprentissage disponibles en France et proposez-les à vos utilisateurs gratuitement et sous un format white-label.",
  },
  parameters: {
    longitude: {
      description: { en: longitude, fr: null },
      examples: [48.8566],
    },
    latitude: {
      description: { en: latitude, fr: null },
      examples: [2.3522],
    },
    radius: {
      description: { en: radius, fr: null },
      examples: [30],
    },
    rncp: {
      description: { en: rncp, fr: null },
      examples: ["RNCP34436", "RNCP183"],
    },
    romes: {
      description: { en: romes, fr: null },
      examples: ["F1601,F1201,F1106", "M1806"],
    },
    target_diploma_level: {
      description: { en: target_diploma_level, fr: null },
      examples: ["3", "4", "5", "6", "7"],
    },
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      description: null,
      _: {
        jobs: {
          description: { en: jobs, fr: null },
        },
        recruiters: {
          description: { en: recruiters, fr: null },
        },
        warnings: {
          description: { en: warnings, fr: null },
          examples: [
            {
              message: "Some warning message",
              code: "WARNING_CODE",
            },
          ],
        },
      },
    },
  },
} as const satisfies DocRoute;
