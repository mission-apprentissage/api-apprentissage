import localisationDescriptionFr from "../../metier/recherche-commune/fr/localisation.description.md.js";
import type { DocModel } from "../../types.js";

export const communeModelDoc = {
  description: { en: null, fr: "Commune" },
  _: {
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
      _: {
        insee: {
          descriptions: [{ en: null, fr: "Code INSEE de la commune" }],
        },
        postaux: {
          descriptions: [{ en: null, fr: "Liste des codes postaux de la commune" }],
        },
      },
    },
    anciennes: {
      descriptions: [{ en: null, fr: "Anciennes communes fusionnées" }],
      _: {
        "[]": {
          descriptions: null,
          _: {
            nom: {
              descriptions: [{ en: null, fr: "Nom de l'ancienne commune" }],
            },
            codeInsee: {
              descriptions: [{ en: null, fr: "Code INSEE de l'ancienne commune" }],
            },
          },
        },
      },
    },
    arrondissements: {
      descriptions: [{ en: null, fr: "Arrondissements de la commune" }],
      _: {
        "[]": {
          descriptions: null,
          _: {
            nom: {
              descriptions: [{ en: null, fr: "Nom de l'arrondissement" }],
            },
            code: {
              descriptions: [{ en: null, fr: "Code INSEE de l'arrondissement" }],
            },
          },
        },
      },
    },
    region: {
      descriptions: [{ en: null, fr: "Région de la commune" }],
      _: {
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
      _: {
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
      _: {
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
      _: {
        centre: {
          descriptions: [
            {
              en: null,
              fr: 'Coordonnées du centre de la commune au format GeoJSON "Point"',
            },
          ],
        },
        bbox: {
          descriptions: [
            {
              en: null,
              fr: 'Coordonnées de la boîte englobante de la commune au format GeoJSON "Polygon"',
            },
          ],
        },
      },
    },
    mission_locale: {
      descriptions: [{ en: null, fr: "Mission locale dont relève la commune" }],
      _: {
        id: {
          descriptions: [{ en: null, fr: "Identifiant de la mission locale" }],
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
        },
        contact: {
          descriptions: [{ en: null, fr: "Contact de la mission locale" }],
          _: {
            email: {
              descriptions: [{ en: null, fr: "Adresse email de la mission locale" }],
            },
            telephone: {
              descriptions: [{ en: null, fr: "Numéro de téléphone de la mission locale" }],
            },
            siteWeb: {
              descriptions: [{ en: null, fr: "Site web de la mission locale" }],
            },
          },
        },
      },
    },
  },
} as const satisfies DocModel;
