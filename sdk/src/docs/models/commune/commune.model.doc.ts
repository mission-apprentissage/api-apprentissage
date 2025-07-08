import localisationDescriptionFr from "../../metier/recherche-commune/fr/localisation.description.md.js";
import localisationDescriptionEn from "../../metier/recherche-commune/en/localisation.description.md.js";
import type { DocTechnicalField } from "../../types.js";

export const communeModelDoc = {
  descriptions: [{ fr: "Commune", en: "Municipality" }],
  properties: {
    nom: {
      descriptions: [{ fr: "Nom de la commune", en: "Name of the municipality" }],
    },
    code: {
      descriptions: [
        {
          fr: "Code INSEE et postaux de la commune",
          en: "INSEE and postal codes of the municipality",
        },
        {
          fr: "Une commune peut avoir plusieurs code postaux, et un code postal peut correspondre à plusieurs communes. Le code INSEE lui est unique pour chaque commune.",
          en: "A municipality can have multiple postal codes, and a postal code can correspond to multiple municipalities. The INSEE code is unique for each municipality.",
        },
      ],
      properties: {
        insee: {
          descriptions: [{ fr: "Code INSEE de la commune", en: "INSEE code of the municipality" }],
        },
        postaux: {
          descriptions: [
            { fr: "Liste des codes postaux de la commune", en: "List of postal codes of the municipality" },
          ],
          items: {
            descriptions: null,
          },
        },
      },
    },
    anciennes: {
      descriptions: [{ fr: "Anciennes communes fusionnées", en: "Merged former municipalities" }],
      items: {
        descriptions: null,
        properties: {
          nom: {
            descriptions: [{ fr: "Nom de l'ancienne commune", en: "Name of the former municipality" }],
          },
          codeInsee: {
            descriptions: [{ fr: "Code INSEE de l'ancienne commune", en: "INSEE code of the former municipality" }],
          },
        },
      },
    },
    arrondissements: {
      descriptions: [{ fr: "Arrondissements de la commune", en: "Districts of the municipality" }],
      items: {
        descriptions: null,
        properties: {
          nom: {
            descriptions: [{ fr: "Nom de l'arrondissement", en: "Name of the district" }],
          },
          code: {
            descriptions: [{ fr: "Code INSEE de l'arrondissement", en: "INSEE code of the district" }],
          },
        },
      },
    },
    region: {
      descriptions: [{ fr: "Région de la commune", en: "Region of the municipality" }],
      properties: {
        codeInsee: {
          descriptions: [{ fr: "Code INSEE de la région", en: "INSEE code of the region" }],
        },
        nom: {
          descriptions: [{ fr: "Nom de la région", en: "Name of the region" }],
        },
      },
    },
    departement: {
      descriptions: [{ fr: "Département de la commune", en: "Department of the municipality" }],
      properties: {
        nom: {
          descriptions: [{ fr: "Nom du département", en: "Name of the department" }],
        },
        codeInsee: {
          descriptions: [
            {
              fr: "Code INSEE du département",
              en: "INSEE code of the department",
            },
          ],
        },
      },
    },
    academie: {
      descriptions: [{ fr: "Académie de la commune", en: "Academy of the municipality" }],
      properties: {
        id: {
          descriptions: [{ fr: "Identifiant de l'académie", en: "ID of the academy" }],
        },
        code: {
          descriptions: [{ fr: "Code de l'académie", en: "Code of the academy" }],
        },
        nom: {
          descriptions: [{ fr: "Nom de l'académie", en: "Name of the academy" }],
        },
      },
    },
    localisation: {
      descriptions: [{ en: localisationDescriptionEn, fr: localisationDescriptionFr }],
      properties: {
        centre: {
          descriptions: [
            {
              fr: 'Coordonnées du centre de la commune au format GeoJSON "Point"',
              en: 'Coordinates of the center of the municipality in GeoJSON "Point" format',
            },
          ],
        },
        bbox: {
          descriptions: [
            {
              fr: 'Coordonnées de la boîte englobante de la commune au format GeoJSON "Polygon"',
              en: 'Coordinates of the bounding box of the municipality in GeoJSON "Polygon" format',
            },
          ],
        },
      },
    },
    mission_locale: {
      descriptions: [{ fr: "Mission locale dont relève la commune", en: '"Mission Locale" of the municipality' }],
      anyOf: [{ descriptions: null }, { descriptions: null }],
    },
  },
} as const satisfies DocTechnicalField;
