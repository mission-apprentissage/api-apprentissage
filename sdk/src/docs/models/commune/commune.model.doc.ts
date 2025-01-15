import localisationDescriptionFr from "../../metier/recherche-commune/fr/localisation.description.md.js";
import type { DocTechnicalField } from "../../types.js";

export const communeModelDoc = {
  descriptions: [{ en: null, fr: "Commune" }],
  properties: {
    nom: {
      descriptions: [{ en: null, fr: "Nom de la commune" }],
    },
    code: {
      descriptions: [
        {
          en: null,
          fr: "Code INSEE et postaux de la commune",
        },
        {
          en: null,
          fr: "Une commune peut avoir plusieurs code postaux, et un code postal peut correspondre à plusieurs communes. Le code INSEE lui est unique pour chaque commune.",
        },
      ],
      properties: {
        insee: {
          descriptions: [{ en: null, fr: "Code INSEE de la commune" }],
        },
        postaux: {
          descriptions: [{ en: null, fr: "Liste des codes postaux de la commune" }],
          items: {
            descriptions: null,
          },
        },
      },
    },
    anciennes: {
      descriptions: [{ en: null, fr: "Anciennes communes fusionnées" }],
      items: {
        descriptions: null,
        properties: {
          nom: {
            descriptions: [{ en: null, fr: "Nom de l'ancienne commune" }],
          },
          codeInsee: {
            descriptions: [{ en: null, fr: "Code INSEE de l'ancienne commune" }],
          },
        },
      },
    },
    arrondissements: {
      descriptions: [{ en: null, fr: "Arrondissements de la commune" }],
      items: {
        descriptions: null,
        properties: {
          nom: {
            descriptions: [{ en: null, fr: "Nom de l'arrondissement" }],
          },
          code: {
            descriptions: [{ en: null, fr: "Code INSEE de l'arrondissement" }],
          },
        },
      },
    },
    region: {
      descriptions: [{ en: null, fr: "Région de la commune" }],
      properties: {
        codeInsee: {
          descriptions: [{ en: null, fr: "Code INSEE de la région" }],
        },
        nom: {
          descriptions: [{ en: null, fr: "Nom de la région" }],
        },
      },
    },
    departement: {
      descriptions: [{ en: null, fr: "Département de la commune" }],
      properties: {
        nom: {
          descriptions: [{ en: null, fr: "Nom du département" }],
        },
        codeInsee: {
          descriptions: [
            {
              en: null,
              fr: "Code INSEE du département",
            },
          ],
        },
      },
    },
    academie: {
      descriptions: [{ en: null, fr: "Académie de la commune" }],
      properties: {
        id: {
          descriptions: [{ en: null, fr: "Identifiant de l'académie" }],
        },
        code: {
          descriptions: [{ en: null, fr: "Code de l'académie" }],
        },
        nom: {
          descriptions: [{ en: null, fr: "Nom de l'académie" }],
        },
      },
    },
    localisation: {
      descriptions: [{ en: null, fr: localisationDescriptionFr }],
      properties: {
        centre: {
          descriptions: [
            {
              en: null,
              fr: 'Coordonnées du centre de la commune au format GeoJSON "Point"',
            },
          ],
          properties: {
            type: {
              descriptions: null,
            },
            coordinates: {
              descriptions: null,
              prefixItems: [
                { descriptions: [{ en: null, fr: "Longitude" }] },
                { descriptions: [{ en: null, fr: "Latitude" }] },
              ],
            },
          },
        },
        bbox: {
          descriptions: [
            {
              en: null,
              fr: 'Coordonnées de la boîte englobante de la commune au format GeoJSON "Polygon"',
            },
          ],
          properties: {
            type: {
              descriptions: null,
            },
            coordinates: {
              descriptions: null,
              items: {
                descriptions: null,
                items: {
                  descriptions: null,
                  prefixItems: [
                    { descriptions: [{ en: null, fr: "Longitude" }] },
                    { descriptions: [{ en: null, fr: "Latitude" }] },
                  ],
                },
              },
            },
          },
        },
      },
    },
    mission_locale: {
      descriptions: [{ en: null, fr: "Mission locale dont relève la commune" }],
      anyOf: [{ descriptions: null }, { descriptions: null }],
    },
  },
} as const satisfies DocTechnicalField;
