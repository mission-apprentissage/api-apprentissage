import { rechercheOffrePageSummaryDoc } from "../../metier/recherche-offre/recherche-offre.doc.js";
import type { DocRoute } from "../../types.js";
import department from "./en/parameters/department.md.js";
import latitude from "./en/parameters/latitude.md.js";
import longitude from "./en/parameters/longitude.md.js";
import opco from "./en/parameters/opco.md.js";
import radius from "./en/parameters/radius.md.js";
import rncp from "./en/parameters/rncp.md.js";
import romes from "./en/parameters/romes.md.js";
import target_diploma_level from "./en/parameters/target_diploma_level.md.js";
import jobs from "./en/response/jobs.md.js";
import recruiters from "./en/response/recruiters.md.js";
import warnings from "./en/response/warnings.md.js";
import departmentFr from "./fr/parameters/departements.md.js";
import latitudeFr from "./fr/parameters/latitude.md.js";
import longitudeFr from "./fr/parameters/longitude.md.js";
import opcoFr from "./fr/parameters/opco.md.js";
import radiusFr from "./fr/parameters/radius.md.js";
import rncpFr from "./fr/parameters/rncp.md.js";
import romesFr from "./fr/parameters/romes.md.js";
import target_diploma_levelFr from "./fr/parameters/target_diploma_level.md.js";
import jobsFr from "./fr/response/jobs.md.js";
import recruitersFr from "./fr/response/recruiters.md.js";
import warningsFr from "./fr/response/warnings.md.js";

export const jobSearchRouteDoc = {
  summary: rechercheOffrePageSummaryDoc.title,
  description: {
    en: "Access in real-time all apprenticeship job opportunities available in France and offer them to your users for free and under a white-label format.",
    fr: "Accéder en temps réel à toutes les opportunités d'emploi en apprentissage disponibles en France et proposez-les à vos utilisateurs gratuitement et sous un format white-label.",
  },
  parameters: {
    longitude: {
      descriptions: [{ en: longitude, fr: longitudeFr }],
      examples: [48.8566],
    },
    latitude: {
      descriptions: [{ en: latitude, fr: latitudeFr }],
      examples: [2.3522],
    },
    radius: {
      descriptions: [{ en: radius, fr: radiusFr }],
      examples: [30],
    },
    rncp: {
      descriptions: [{ en: rncp, fr: rncpFr }],
      examples: ["RNCP34436", "RNCP183"],
    },
    romes: {
      descriptions: [{ en: romes, fr: romesFr }],
      examples: ["F1601,F1201,F1106", "M1806"],
    },
    departements: {
      descriptions: [{ en: department, fr: departmentFr }],
      examples: ["75&departements=06", "06"],
    },
    opco: {
      descriptions: [{ en: opco, fr: opcoFr }],
      examples: ["AFDAS"],
    },
    target_diploma_level: {
      descriptions: [{ en: target_diploma_level, fr: target_diploma_levelFr }],
      examples: ["3", "4", "5", "6", "7"],
    },
    partners_to_exclude: {
      descriptions: [
        {
          en: "List of partners labels to exclude from the search.<br />This list changes regularly. The updated list is available [at this url](http://labonnealternance.apprentissage.beta.gouv.fr/metabase/public/question/70f84c13-6156-4933-9fb3-54c88887d95d)",
          fr: "Liste des labels de partenaires à exclure de la recherche.<br />Cette liste change régulièrement. La liste mise à jour est disponible [à cette adresse](http://labonnealternance.apprentissage.beta.gouv.fr/metabase/public/question/70f84c13-6156-4933-9fb3-54c88887d95d)",
        },
      ],
      examples: ["Hellowork&partners_to_exclude=RH Alternance", "Hellowork"],
    },
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: null,
      properties: {
        jobs: {
          descriptions: [{ en: jobs, fr: jobsFr }],
          items: {
            descriptions: null,
          },
        },
        recruiters: {
          descriptions: [{ en: recruiters, fr: recruitersFr }],
          items: {
            descriptions: null,
          },
        },
        warnings: {
          descriptions: [{ en: warnings, fr: warningsFr }],
          examples: [
            {
              message: "Some warning message",
              code: "WARNING_CODE",
            },
          ],
          items: {
            descriptions: null,
            properties: {
              message: {
                descriptions: null,
              },
              code: {
                descriptions: null,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies DocRoute;
