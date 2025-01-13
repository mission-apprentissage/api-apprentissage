import type { DocModel } from "../../types.js";

export const missionLocaleModelDoc = {
  description: { en: null, fr: "Mission Locale" },
  _: {
    id: {
      descriptions: [{ en: null, fr: "Identifiant de la Mission Locale" }],
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
      _: {
        geopoint: {
          descriptions: [{ en: null, fr: 'Coordonnés GPS au format GeoJSON "Point"' }],
          _: {
            type: {
              descriptions: null,
            },
            coordinates: {
              descriptions: null,
              _: {
                0: {
                  descriptions: [{ en: null, fr: "Longitude" }],
                },
                1: {
                  descriptions: [{ en: null, fr: "Latitude" }],
                },
              },
            },
          },
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
      _: {
        email: {
          descriptions: [{ en: null, fr: "Email de contact de la mission locale" }],
        },
        telephone: {
          descriptions: [{ en: null, fr: "Téléphone de contact de la mission locale" }],
        },
        siteWeb: {
          descriptions: [{ en: null, fr: "Site web de la mission locale" }],
        },
      },
    },
  },
} as const satisfies DocModel;
