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
  summary: "Search for apprenticeship job opportunities",
  description:
    "Access in real-time all apprenticeship job opportunities available in France and offer them to your users for free and under a white-label format.",
  parameters: {
    longitude: {
      description: longitude,
      examples: [48.8566],
    },
    latitude: {
      description: latitude,
      examples: [2.3522],
    },
    radius: {
      description: radius,
      examples: [30],
    },
    rncp: {
      description: rncp,
      examples: ["RNCP34436", "RNCP183"],
    },
    romes: {
      description: romes,
      examples: ["F1601,F1201,F1106", "M1806"],
    },
    target_diploma_level: {
      description: target_diploma_level,
      examples: ["3", "4", "5", "6", "7"],
    },
  },
  response: {
    description: "Success",
    content: {
      description: null,
      _: {
        jobs: {
          description: jobs,
        },
        recruiters: {
          description: recruiters,
        },
        warnings: {
          description: warnings,
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
