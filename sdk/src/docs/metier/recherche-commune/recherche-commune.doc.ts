import type { DocPage, OpenApiText } from "../../types.js";
import localisationDescriptionEn from "./en/localisation.description.md.js";
import localisationDescriptionFr from "./fr/localisation.description.md.js";

export const rechercheCommunePageSummaryDoc = {
  en: "Consult the list of municipalities in France",
  fr: "Consulter le référentiel des communes de France",
} as OpenApiText;

export const rechercheCommunePageDoc = {
  tag: "geographie",
  operationIds: ["communeSearch"],
  habilitation: null,
  description: [
    {
      en: "Search for a municipality by INSEE code or postal code.",
      fr: "Rechercher une commune par code INSEE ou code postal.",
    },
  ],
  frequenceMiseAJour: "daily",
  type: "data",
  sources: [
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
  ],
  data: [
    {
      name: { en: null, fr: "Commune" },
      sections: {
        commune: {
          name: { en: null, fr: "Commune" },
          rows: {
            nom: {
              description: { en: null, fr: "Nom de la commune" },
              sample: { en: null, fr: "exemple : Paris" },
              tags: [".nom"],
            },
            code: {
              description: {
                en: null,
                fr: "Code INSEE et postaux de la commune",
              },
              information: {
                en: null,
                fr: "Une commune peut avoir plusieurs code postaux, et un code postal peut correspondre à plusieurs communes. Le code INSEE lui est unique pour chaque commune.",
              },
              tags: [".code.insee", ".code.postaux"],
            },
            anciennes: {
              description: { en: null, fr: "Anciennes communes fusionnées" },
              tags: [".anciennes[].nom", ".anciennes[].codeInsee"],
            },
            arrondissements: {
              description: { en: null, fr: "Arrondissements de la commune" },
              tags: [".arrondissements[].nom", ".arrondissements[].codeInsee"],
            },
            localisation: {
              description: { en: localisationDescriptionEn, fr: localisationDescriptionFr },
              tags: [".localisation.centre", ".localisation.bbox"],
            },
          },
        },
        region: {
          name: { en: null, fr: "Région" },
          rows: {
            region: {
              description: { en: null, fr: "Région de la commune" },
              information: {
                en: null,
                fr: "Les collectivités et territoires d'outre-mer sont assimilés à des régions pour des raisons pratiques. Le code INSEE utilisé correspond au code INSEE de la collectivité ou du territoire d'outre-mer.",
              },
              tags: [".region.nom", ".region.codeInsee"],
            },
          },
        },
        departement: {
          name: { fr: "Département", en: "Department" },
          rows: {
            departement: {
              description: { en: null, fr: "Département de la commune" },
              tags: [".departement.nom", ".departement.codeInsee"],
              information: {
                en: null,
                fr: "Les collectivités et territoires d'outre-mer sont assimilés à des déparements pour des raisons pratiques. Le code INSEE utilisé correspond au code INSEE de la collectivité ou du territoire d'outre-mer.",
              },
            },
          },
        },
        academie: {
          name: { en: null, fr: "Académie" },
          rows: {
            academie: {
              description: { en: null, fr: "Académie de la commune" },
              tags: [".academie.nom", ".academie.id", ".academie.code"],
              information: {
                en: null,
                fr: "L'académie de l'Étranger correspond à **L'Agence pour l’enseignement français à l’étranger (AEFE)**, elle est associée à du territoire d'outre-mer des **Terres australes et antarctiques françaises**.",
              },
            },
          },
        },
        mission_locale: {
          name: { en: "Mission locale", fr: "Mission locale" },
          rows: {
            identification: {
              description: { en: null, fr: "Mission locale dont relève la commune" },
              tags: [".mission_locale.id", ".mission_locale.nom", ".mission_locale.siret"],
            },
            localisation: {
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
              description: { en: null, fr: "Contact de la mission locale" },
              tags: [
                ".mission_locale.contact.email",
                ".mission_locale.contact.telephone",
                ".mission_locale.contact.siteWeb",
              ],
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
