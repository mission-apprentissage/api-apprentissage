import type { DataSource, DocModel } from "../../types.js";

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
];

export const departementModelDoc = {
  name: "Departement",
  description: null,
  sources,
  _: {
    nom: {
      section: {
        en: null,
        fr: "Intitulé",
      },
      metier: true,
      description: { en: null, fr: "Département de la commune" },
      sample: { en: null, fr: "exemple : Nord" },
      tags: [".nom"],
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
    },
    codeInsee: {
      section: {
        en: null,
        fr: "Code INSEE",
      },
      metier: true,
      description: {
        en: null,
        fr: "Code INSEE du département",
      },
      tags: [".codeInsee"],
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
  },
} as const satisfies DocModel;
