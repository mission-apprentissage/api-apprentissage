import type { OpenApiText } from "../docs/types.js";

export const tagsOpenapi = {
  try: {
    name: { fr: "Essayer l'API", en: "Try the API" },
    description: {
      fr: "Pour essayer l'API [vous pouvez utiliser le swagger UI](/documentation-technique/try)",
      en: "To try the API [you can use the swagger UI](/documentation-technique/try)",
    },
  },
  job: {
    name: { fr: "Offre Emploi", en: "Job" },
    description: { fr: "Opportunités d'emploi en alternance", en: "Apprenticeship job opportunities" },
  },
  formation: {
    name: { fr: "Formation", en: "Training" },
    description: {
      fr: "Liste des opérations sur les formations en apprentissage",
      en: "List of operations on apprenticeship training",
    },
  },
  certifications: {
    name: { fr: "Certifications", en: "Certifications" },
    description: { fr: "Liste des opérations sur les certifications.", en: "List of operations on certifications." },
  },
  organismes: {
    name: { fr: "Organismes", en: "Organisms" },
    description: { fr: "Liste des organismes", en: "List of organisms" },
  },
  geographie: {
    name: { fr: "Géographie", en: "Geography" },
    description: { fr: "Référentiel Géographique", en: "Geographical Referential" },
  },
  exprimental: {
    name: { fr: "Expérimental", en: "Experimental" },
    description: {
      fr: "Liste des routes expérimentales. Attention: ces routes peuvent changer sans préavis.",
      en: "List of experimental routes. Warning: these routes may change without notice.",
    },
  },
  system: {
    name: { fr: "Système", en: "System" },
    description: { fr: "Routes système", en: "System routes" },
  },
} as const satisfies Record<
  string,
  {
    name: OpenApiText;
    description: OpenApiText;
  }
>;

export type TagOpenapi = keyof typeof tagsOpenapi;
