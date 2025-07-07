import type { DocTechnicalField } from "../../types.js";

export const missionLocaleModelDoc = {
  descriptions: [{ fr: "Mission Locale", en: '"Mission Locale"' }],
  properties: {
    id: {
      descriptions: [{ fr: "Identifiant de la Mission Locale", en: '"Mission Locale" ID' }],
    },
    code: {
      descriptions: [{ fr: "Code de la mission locale", en: '"Mission Locale" Code' }],
    },
    nom: {
      descriptions: [{ fr: "Nom de la mission locale", en: '"Mission Locale" Name' }],
    },
    siret: {
      descriptions: [{ fr: "Numéro SIRET de la mission locale", en: '"Mission Locale" SIRET Number' }],
    },
    localisation: {
      descriptions: [
        {
          fr: "Localisation de la mission locale",
          en: '"Mission Locale" Location',
        },
      ],
      properties: {
        geopoint: {
          descriptions: [
            { fr: 'Coordonnés GPS au format GeoJSON "Point"', en: 'GPS coordinates in GeoJSON "Point" format' },
          ],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
        adresse: {
          descriptions: [{ fr: "Adresse de la Mission Locale", en: '"Mission Locale" Address' }],
        },
        cp: {
          descriptions: [{ fr: "Code postal de la Mission Locale", en: '"Mission Locale" Postal Code' }],
        },
        ville: {
          descriptions: [{ fr: "Ville de la Mission Locale", en: '"Mission Locale" City' }],
        },
      },
    },
    contact: {
      descriptions: [{ fr: "Contact de la mission locale", en: '"Mission Locale" Contact Information' }],
      properties: {
        email: {
          descriptions: [{ fr: "Email de contact de la mission locale", en: '"Mission Locale" Contact Email' }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
        telephone: {
          descriptions: [{ fr: "Téléphone de contact de la mission locale", en: '"Mission Locale" Contact Phone' }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
        siteWeb: {
          descriptions: [{ fr: "Site web de la mission locale", en: '"Mission Locale" Website' }],
          anyOf: [{ descriptions: null }, { descriptions: null }],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
