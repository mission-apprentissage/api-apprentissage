import type { DocTechnicalField } from "../../types.js";

export const missionLocaleModelDoc = {
  descriptions: [{ en: null, fr: "Mission Locale" }],
  properties: {
    id: {
      descriptions: [{ en: null, fr: "Identifiant de la Mission Locale" }],
    },
    code: {
      descriptions: [{ en: null, fr: "Code de la mission locale" }],
    },
    nom: {
      descriptions: [{ en: null, fr: "Nom de la mission locale" }],
    },
    siret: {
      descriptions: [{ en: null, fr: "Numéro SIRET de la mission locale" }],
    },
    localisation: {
      descriptions: [
        {
          en: null,
          fr: "Localisation de la mission locale",
        },
      ],
      properties: {
        geopoint: {
          descriptions: [{ en: null, fr: 'Coordonnés GPS au format GeoJSON "Point"' }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
        adresse: {
          descriptions: [{ en: null, fr: "Adresse de la Mission Locale" }],
        },
        cp: {
          descriptions: [{ en: null, fr: "Code postal de la Mission Locale" }],
        },
        ville: {
          descriptions: [{ en: null, fr: "Ville de la Mission Locale" }],
        },
      },
    },
    contact: {
      descriptions: [{ en: null, fr: "Contact de la mission locale" }],
      properties: {
        email: {
          descriptions: [{ en: null, fr: "Email de contact de la mission locale" }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
        telephone: {
          descriptions: [{ en: null, fr: "Téléphone de contact de la mission locale" }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
        siteWeb: {
          descriptions: [{ en: null, fr: "Site web de la mission locale" }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
