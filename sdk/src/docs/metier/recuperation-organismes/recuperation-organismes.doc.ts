import type { DocPage, OpenApiText } from "../../types.js";

export const recuperationOrganismesPageSummaryDoc = {
  title: {
    fr: "Récupération des organismes de formation en apprentissage",
    en: "Retrieve all training organizations in apprenticeship",
  },
  headline: {
    en: "Retrieve the list of all organizations from the Onisep repository historized.",
    fr: "Récupère la liste de tous les organismes issus du référentiel Onisep historisé.",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const recuperationOrganismesPageDoc = {
  tag: "organismes",
  operationIds: ["exportOrganismes"],
  habilitation: null,
  description: [recuperationOrganismesPageSummaryDoc.headline],
  frequenceMiseAJour: "daily",
  type: "data",
  sources: [
    {
      name: "Référentiel UAI-SIRET des OFA-CFA",
      logo: { href: "/asset/logo/onisep.png" },
      providers: ["ONISEP"],
      href: "https://referentiel.apprentissage.onisep.fr/organismes",
    },
    {
      name: "API Entreprise",
      logo: { href: "/images/logo_gouvernement.svg" },
      providers: ["Direction interministérielle du numérique (DINUM)"],
      href: "https://entreprise.api.gouv.fr",
    },
  ],
  data: [
    {
      name: { fr: "Organisme", en: "Organism" },
      sections: {
        global: {
          name: null,
          rows: {
            identifiant: {
              description: [
                {
                  fr: "L'identifiant unique d'un organisme de formation est constitué du couple UAI-SIRET",
                  en: "The unique identifier of a training organization is made up of the UAI-SIRET pair",
                },
                {
                  fr: "Un UAI peut être associé à plusieurs SIRET.",
                  en: "A UAI can be associated with several SIRET.",
                },
                {
                  fr: "Un SIRET peut être associé à plusieurs UAI. Mais à un instant donné un SIRET est associé à un seul UAI dans le référentiel.",
                  en: "A SIRET can be associated with several UAI. But at a given time a SIRET is associated with only one UAI in the repository.",
                },
              ],
              information: {
                fr: "Bien que les organismes sont unique par SIRET dans le [référentiel](https://referentiel.apprentissage.onisep.fr/organismes), l'historisation peut conduire à des situations où un SIRET est associé à plusieurs UAI. **L'unicité d'un organisme est ainsi garantie par le couple UAI-SIRET.**",
                en: "Although the organism are unique by SIRET in the [repository](https://referentiel.apprentissage.onisep.fr/organismes), the historization can lead to situations where a SIRET is associated with several UAI. **The uniqueness of an organization is thus guaranteed by the UAI-SIRET pair.**",
              },
              tags: ["uai", "siret"],
            },
            statut: {
              description: [
                {
                  fr: "Statut de l'organisme dans le référentiel des organismes de formation",
                  en: "Status of the organization in the training organizations repository",
                },
                { fr: "Les valeurs possibles sont: ", en: "Possible values are: " },
                {
                  fr: "- `présent` pour les organismes présent dans le référentiel",
                  en: "- `présent` for organism present in the repository",
                },
                {
                  fr: "- `supprimé` pour les organismes supprimés du référentiel",
                  en: "- `supprimé` for organism deleted from the repository",
                },
              ],
              tags: ["referentiel"],
            },
            renseignements_specifiques: {
              description: [
                { fr: "Renseignements spécifiques de l'organisme", en: "Specific information of the organization" },
                {
                  fr: "Les informations spécifiques sont des informations propres à l'organisme de formation.",
                  en: "Specific information are information specific to the training organization.",
                },
              ],
              tags: ["qualiopi", "numero_activite"],
            },
            contacts: {
              description: [
                {
                  fr: "Liste des emails de contact de l'organisme de formation.",
                  en: "List of contact emails of the training organization.",
                },
              ],
              information: {
                fr: "Les contacts sont issus de différentes sources, nous ne sommes pas en mesure de garantir la validité des emails.",
                en: "The contacts come from different sources, we are not able to guarantee the validity of the emails.",
              },
              tags: ["email", "sources", "confirmation_referentiel"],
            },
          },
        },
        etablissement: {
          name: { fr: "Établissement", en: "Establishment" },
          rows: {
            siret: {
              description: [{ fr: "Numéro SIRET de l'établissement", en: "Establishment SIRET number" }],
            },
            adresse: {
              description: [
                { fr: "Adresse de l'établissement", en: "Establishment address" },
                {
                  fr: "En plus de l'adresse postale, le découpage géographique est également fournie (département, région, académie)",
                  en: "In addition to the postal address, the geographical breakdown is also provided (department, region, academy)",
                },
              ],
              tags: ["label", "code_postal", "commune", "departement", "region", "academie"],
            },
            geopoint: {
              description: [{ fr: "Coordonnées GPS de l'établissement", en: "Establishment's GPS coordinates" }],
            },
            ouvert: {
              description: [
                {
                  fr: "Indique si l'établissement est ouvert ou fermé",
                  en: "Indicates if the establishment is open or closed",
                },
              ],
            },
            creation: {
              description: { fr: "Date de création de l'établissement", en: "Establishment creation date" },
            },
            fermeture: {
              description: [{ fr: "Date de fermeture de l'établissement", en: "Establishment closure date" }],
            },
          },
        },
        unite_legale: {
          name: { fr: "Unité légale", en: "Legal unit" },
          rows: {
            siren: {
              description: [{ fr: "Numéro SIREN de l'unité légale", en: "Legal unit SIREN number" }],
            },
            actif: {
              description: [
                { fr: "Indique si l'unité légale est active", en: "Indicates if the legal unit is active" },
              ],
            },
            raison_sociale: {
              description: [{ fr: "Raison sociale de l'entreprise", en: "Company name" }],
            },
            creation: {
              description: [{ fr: "Date de création de l'entreprise", en: "Company creation date" }],
            },
            cessation: {
              description: [{ fr: "Date de cessation de l'entreprise", en: "Company cessation date" }],
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
