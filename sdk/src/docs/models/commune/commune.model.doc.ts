import type { DataSource, DocModel } from "../../types.js";
import localisationDescriptionFr from "./docs/fr/localisation.description.md.js";

const sources: DataSource[] = [
  {
    name: "API Découpage administratif",
    logo: { href: "/asset/logo/etalab.png" },
    providers: ["Etalab"],
    href: "https://geo.api.gouv.fr/decoupage-administratif",
  },
  {
    name: "API Métadonnées",
    logo: { href: "/asset/logo/insee.png" },
    providers: ["Institut national de la statistique et des études économiques (INSEE)"],
    href: "https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=M%C3%A9tadonn%C3%A9es&version=V1&provider=insee",
  },
  {
    name: "Référentiel géographique français, communes, unités urbaines, aires urbaines, départements, académies, régions",
    logo: { href: "/asset/logo/enseigne-sup.png" },
    providers: ["ministre de l'Enseignement supérieur et de la Recherche (MESR)"],
    href: "https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-referentiel-geographique/information/",
  },
  {
    name: "Union Nationale des Missions Locales",
    logo: { href: "/asset/logo/unml.svg" },
    providers: ["Union Nationale des Missions Locales"],
    href: "https://www.unml.info/",
  },
];

export const communeModelDoc = {
  name: "Commune",
  description: null,
  sources,
  _: {
    nom: {
      section: {
        en: null,
        fr: "Intitulé",
      },
      metier: true,
      description: { en: null, fr: "Nom de la commune" },
      sample: { en: null, fr: "exemple : Paris" },
      tags: [".nom"],
    },
    code: {
      section: {
        en: null,
        fr: "Code INSEE et postaux",
      },
      metier: true,
      description: {
        en: null,
        fr: "Code INSEE et postaux de la commune",
      },
      information: {
        en: null,
        fr: "Une commune peut avoir plusieurs code postaux, et un code postal peut correspondre à plusieurs communes. Le code INSEE lui est unique pour chaque commune.",
      },
      tags: [".code.insee", ".code.postaux"],
      _: {
        insee: {
          description: { en: null, fr: "Code INSEE de la commune" },
        },
        postaux: {
          description: { en: null, fr: "Liste des codes postaux de la commune" },
        },
      },
    },
    region: {
      section: {
        en: null,
        fr: "Région",
      },
      metier: true,
      description: { en: null, fr: "Région de la commune" },
      tip: {
        title: {
          en: null,
          fr: "Collectivités et territoires d'outre-mer",
        },
        content: {
          en: null,
          fr: "Les collectivités et territoires d'outre-mer sont assimilés à des régions pour des raisons pratiques. Le code INSEE utilisé correspond au code INSEE de la collectivité ou du territoire d'outre-mer.",
        },
      },
      tags: [".region"],
      _: {
        codeInsee: {
          description: { en: null, fr: "Code INSEE de la région" },
        },
        nom: {
          description: { en: null, fr: "Nom de la région" },
        },
      },
    },
    departement: {
      section: {
        en: null,
        fr: "Département",
      },
      metier: true,
      description: { en: null, fr: "Département de la commune" },
      tip: {
        title: {
          en: null,
          fr: "Collectivités et territoires d'outre-mer",
        },
        content: {
          en: null,
          fr: "Les collectivités et territoires d'outre-mer sont assimilés à des déparements pour des raisons pratiques. Le code INSEE utilisé correspond au code INSEE de la collectivité ou du territoire d'outre-mer.",
        },
      },
      tags: [".departement"],
      _: {
        codeInsee: {
          description: { en: null, fr: "Code du département" },
        },
        nom: {
          description: { en: null, fr: "Nom du département" },
        },
      },
    },
    academie: {
      section: {
        en: null,
        fr: "Académie",
      },
      metier: true,
      description: { en: null, fr: "Académie de la commune" },
      tags: [".academie"],
      _: {
        id: {
          description: { en: null, fr: "Identifiant de l'académie" },
        },
        code: {
          description: { en: null, fr: "Code de l'académie" },
        },
        nom: {
          description: { en: null, fr: "Nom de l'académie" },
        },
      },
      tip: {
        title: {
          en: null,
          fr: "Académie de l'Étranger",
        },
        content: {
          en: null,
          fr: "L'académie de l'Étranger correspond à **L'Agence pour l’enseignement français à l’étranger (AEFE)**, elle est associée à du territoire d'outre-mer des **Terres australes et antarctiques françaises**.",
        },
      },
    },
    localisation: {
      section: {
        en: null,
        fr: "Localisation",
      },
      metier: true,
      description: { en: null, fr: localisationDescriptionFr },
      tags: [".localisation.centre", ".localisation.bbox"],
      _: {
        centre: {
          section: {
            en: null,
            fr: "Localisation",
          },
          description: {
            en: null,
            fr: 'Coordonnées du centre de la commune au format GeoJSON "Point"',
          },
        },
        bbox: {
          section: {
            en: null,
            fr: "Localisation",
          },
          description: {
            en: null,
            fr: 'Coordonnées de la boîte englobante de la commune au format GeoJSON "Polygon"',
          },
        },
      },
    },
    mission_locale: {
      section: {
        en: null,
        fr: "Mission locale",
      },
      metier: true,
      description: { en: null, fr: "Mission locale dont relève la commune" },
      tags: [".mission_locale.id", ".mission_locale.nom", ".mission_locale.siret"],
      _: {
        id: {
          description: { en: null, fr: "Identifiant de la mission locale" },
        },
        nom: {
          description: { en: null, fr: "Nom de la mission locale" },
        },
        siret: {
          description: { en: null, fr: "Numéro SIRET de la mission locale" },
        },
        localisation: {
          metier: true,
          section: {
            en: null,
            fr: "Localisation",
          },
          description: {
            en: null,
            fr: "Localisation de la mission locale",
          },
          tags: [
            ".mission_locale.localisation.geopoint",
            ".mission_locale.localisation.adresse",
            ".mission_locale.localisation.cp",
            ".mission_locale.localisation.ville",
          ],
        },
        contact: {
          metier: true,
          section: {
            en: null,
            fr: "Contact",
          },
          description: { en: null, fr: "Contact de la mission locale" },
          tags: [
            ".mission_locale.contact.email",
            ".mission_locale.contact.telephone",
            ".mission_locale.contact.siteWeb",
          ],
          _: {
            email: {
              description: { en: null, fr: "Adresse email de la mission locale" },
            },
            telephone: {
              description: { en: null, fr: "Numéro de téléphone de la mission locale" },
            },
            siteWeb: {
              description: { en: null, fr: "Site web de la mission locale" },
            },
          },
        },
      },
    },
  },
} as const satisfies DocModel;
