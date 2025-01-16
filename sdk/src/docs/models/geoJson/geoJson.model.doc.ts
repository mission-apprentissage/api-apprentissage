import type { DocTechnicalField } from "../../types.js";

export const geoJsonPointModelDoc = {
  descriptions: null,
  properties: {
    type: {
      descriptions: null,
    },
    coordinates: {
      descriptions: null,
      prefixItems: [
        { descriptions: [{ en: "Longitude", fr: "Longitude" }], examples: [48.850699] },
        { descriptions: [{ en: "Latiude", fr: "Latitude" }], examples: [2.308628] },
      ],
    },
  },
} as const satisfies DocTechnicalField;

export const geoJsonPolygonModelDoc = {
  descriptions: null,
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
            { descriptions: [{ en: "Longitude", fr: "Longitude" }], examples: [48.850699] },
            { descriptions: [{ en: "Latiude", fr: "Latitude" }], examples: [2.308628] },
          ],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;

export const adresseModelDoc = {
  descriptions: [{ fr: "Adresse", en: "Address" }],
  properties: {
    academie: {
      descriptions: [{ fr: "Académie", en: "Academy" }],
      properties: {
        code: {
          descriptions: [
            {
              fr: "Code de l'académie",
              en: "Code of the academy",
            },
          ],
          examples: ["A1"],
        },
        id: {
          descriptions: [
            {
              fr: "Identifiant de l'académie",
              en: "Identifier of the academy",
            },
          ],
          examples: ["1"],
        },
        nom: {
          descriptions: [
            {
              fr: "Nom de l'académie",
              en: "Name of the academy",
            },
          ],
          examples: ["Académie de Paris"],
        },
      },
    },
    code_postal: {
      descriptions: [{ fr: "Code postal", en: "Postal code" }],
    },
    commune: {
      descriptions: [{ fr: "Ville", en: "City" }],
      properties: {
        code_insee: {
          descriptions: [
            {
              fr: "Code INSEE de la ville",
              en: "INSEE code of the city",
            },
          ],
        },
        nom: {
          descriptions: [{ fr: "Nom de la ville", en: "Name of the city" }],
        },
      },
    },
    departement: {
      descriptions: [{ fr: "Département", en: "Department" }],
      properties: {
        code_insee: {
          descriptions: [
            {
              fr: "Code INSEE du département",
              en: "INSEE code of the department",
            },
          ],
        },
        nom: {
          descriptions: [
            {
              fr: "Nom du département",
              en: "Name of the department",
            },
          ],
        },
      },
    },
    label: {
      descriptions: [{ fr: "Libellé de l'adresse", en: "address label" }],
    },
    region: {
      descriptions: [{ fr: "Région", en: "Region" }],
      properties: {
        code_insee: {
          descriptions: [
            {
              fr: "Code INSEE de la région",
              en: "INSEE code of the region",
            },
          ],
        },
        nom: {
          descriptions: [{ fr: "Nom de la région", en: "Name of the region" }],
        },
      },
    },
  },
};
