import type { DataSource, DocModel } from "../../types.js";

const sources: DataSource[] = [
  {
    name: "Union Nationale des Missions Locales",
    logo: { href: "/asset/logo/unml.svg" },
    providers: ["Union Nationale des Missions Locales"],
    href: "https://www.unml.info/",
  },
];

export const missionLocaleModelDoc = {
  name: "Mission Locale",
  description: { en: null, fr: "Mission Locale" },
  sources,
  sections: {
    identification: {
      name: { en: null, fr: "Identification" },
      _: {
        id: {
          metier: true,
          description: { en: null, fr: "Identifiant de la Mission Locale" },
          tags: [".id"],
        },
        nom: {
          metier: true,
          description: { en: null, fr: "Nom de la mission locale" },
          tags: [".nom"],
        },
        siret: {
          metier: true,
          description: { en: null, fr: "Numéro SIRET de la mission locale" },
          tags: [".siret"],
        },
      },
    },
    localisation: {
      name: { en: null, fr: "Localisation" },
      _: {
        localisation: {
          metier: true,
          description: {
            en: null,
            fr: "Localisation de la mission locale",
          },
          tags: [".localisation"],
          _: {
            geopoint: {
              metier: true,
              description: { en: null, fr: 'Coordonnés GPS au format GeoJSON "Point"' },
              tags: [".localisation.geopoint"],
            },
            adresse: {
              metier: true,
              description: { en: null, fr: "Adresse de la Mission Locale" },
              tags: [".localisation.adresse"],
            },
            cp: {
              metier: true,
              description: { en: null, fr: "Code postal de la Mission Locale" },
              tags: [".localisation.cp"],
            },
            ville: {
              metier: true,
              description: { en: null, fr: "Ville de la Mission Locale" },
              tags: [".localisation.ville"],
            },
          },
        },
      },
    },
  },
} as const satisfies DocModel;
