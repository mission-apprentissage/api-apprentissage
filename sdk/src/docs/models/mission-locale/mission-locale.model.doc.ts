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
  description: null,
  sources,
  _: {
    id: {
      section: {
        en: null,
        fr: "Identifiant",
      },
      metier: true,
      description: { en: null, fr: "Identifiant de la Mission Locale" },
      tags: [".id"],
    },
    nom: {
      section: {
        en: null,
        fr: "Nom",
      },
      metier: true,
      description: { en: null, fr: "Nom de la mission locale" },
      tags: [".nom"],
    },
    siret: {
      section: {
        en: null,
        fr: "Siret",
      },
      metier: true,
      description: { en: null, fr: "Numéro SIRET de la mission locale" },
      tags: [".siret"],
    },
    localisation: {
      section: {
        en: null,
        fr: "Localisation",
      },
      metier: true,
      description: {
        en: null,
        fr: "Localisation de la mission locale",
      },
      tags: [".localisation"],
      _: {
        geopoint: {
          metier: true,
          section: {
            en: null,
            fr: "Localisation",
          },
          description: { en: null, fr: 'Coordonnés GPS au format GeoJSON "Point"' },
          tags: [".localisation.geopoint"],
        },
        adresse: {
          metier: true,
          section: {
            en: null,
            fr: "Adresse Postale",
          },
          description: { en: null, fr: "Adresse de la Mission Locale" },
          tags: [".localisation.adresse"],
        },
        cp: {
          metier: true,
          section: {
            en: null,
            fr: "Adresse Postale",
          },
          description: { en: null, fr: "Code postal de la Mission Locale" },
          tags: [".localisation.cp"],
        },
        ville: {
          metier: true,
          section: {
            en: null,
            fr: "Adresse Postale",
          },
          description: { en: null, fr: "Ville de la Mission Locale" },
          tags: [".localisation.ville"],
        },
      },
    },
  },
} as const satisfies DocModel;
