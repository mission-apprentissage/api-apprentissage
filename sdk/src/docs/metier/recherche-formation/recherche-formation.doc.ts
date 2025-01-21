import type { DocPage, OpenApiText } from "../../types.js";
import { certificationsPageDoc } from "../certifications/certifications.doc.js";
import { rechercheCommunePageDoc } from "../recherche-commune/recherche-commune.doc.js";

export const rechercheFormationPageSummaryDoc = {
  title: {
    en: "Search for training courses in apprenticeship",
    fr: "Recherche de formations en apprentissage",
  },
  headline: {
    fr: "Recherche les formations présent dans le catalogue réglementaire des formations en apprentissage.",
    en: "Searches for training courses present in the regulatory catalog of training courses in apprenticeship.",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const rechercheFormationPageDoc = {
  tag: "formation",
  operationIds: ["searchFormations"],
  habilitation: null,
  description: [
    {
      fr: "**Accédez gratuitement et en temps réel à l'ensemble des formations en apprentissage disponibles sur le territoire français.** ",
      en: "**Access all training courses available in apprenticeship for free and in real-time on the French territory.** ",
    },
    {
      fr: "Les formations retournée sont celles collectées par [le catalogue des formations en apprentissage](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
      en: "The returned training courses are those collected by [the apprenticeship training catalog](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
    },
    {
      fr: "**💡 Vous pouvez rechercher dans l’ensemble des formations selon les critères suivants : Code(s) ROME, RNCP, géolocalisation, niveau de diplôme et rayon de recherche.**",
      en: "**💡 You can search for all job training courses according to the following criteria: ROME code(s), RNCP, geolocation, diploma level and search radius.**",
    },
    {
      fr: "Les résulats sont retournés par distance croissante au lieu de recherche si ce dernier a été fourni.",
      en: "Results are returned in increasing distance from the search location if it was provided.",
    },
  ],
  frequenceMiseAJour: "daily",
  type: "data",
  sources: [
    {
      name: "Catalogue des offres de formations en apprentissage",
      logo: { href: "/asset/logo/carif-oref.png" },
      providers: ["Réseau des CARIF OREF"],
      href: "https://catalogue-apprentissage.intercariforef.org/",
    },
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
    ...certificationsPageDoc.sources,
    ...rechercheCommunePageDoc.sources,
  ],
  data: [
    {
      name: { en: null, fr: "Formation" },
      sections: {
        global: {
          name: null,
          rows: {
            identifiant: {
              description: [
                {
                  fr: "Identifiant unique pour identifier une formation sur [le catalogue des formations en apprentissage](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
                  en: "Unique identifier to identify a training on [the apprenticeship training catalog](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
                },
              ],
              tags: ["cle_ministere_educatif"],
            },
            statut: {
              description: [
                { fr: "Statut de la formation dans le catalogue des formations", en: "Training status" },
                { fr: "Les valeurs possibles sont: ", en: "Possible values are: " },
                {
                  fr: "- `publié` pour les formations publiées sur le catalogue",
                  en: "for published training courses",
                },
                {
                  fr: "- `archivé` pour les formations disponible sur le catalogue mais non publiées",
                  en: "for training courses available in the catalogue but not published",
                },
                {
                  fr: "- `supprimé` pour les formations supprimées du catalogue",
                  en: "for training courses deleted from the catalogue",
                },
              ],
              tags: ["catalogue"],
            },
            contact: {
              description: [
                {
                  fr: "Coordonnées de contact des pour toute demande d'information liée à la formation. Ces coordonnées sont fournis par l'organisme de formation ou l'organisme responsable.",
                  en: "Contact details for any information related to the training. This information is provided by the training organism or the responsible organism.",
                },
              ],
              tags: ["email", "telephone"],
            },
            contenu_educatif: {
              description: {
                fr: "Descriptif de la formation à destination des potentiels apprenants.",
                en: "Description of the training for potential learners.",
              },
              tags: ["contenu", "objectif"],
            },
            modalite: {
              description: [
                { fr: "Modalité de la formation composé de:", en: "Training modality" },
                { fr: "- L'année du cycle de la formation", en: "The year of the training cycle" },
                { fr: "- La durée indicative de la formation", en: "The indicative duration of the training" },
                { fr: "- Si la formation est entièrement à distance", en: "If the training is entirely remote" },
                { fr: "- Le code MEF 10 de la formation", en: "The training MEF 10 code" },
              ],
              tags: ["annee_cycle", "duree_indicative", "entierement_a_distance", "mef_10"],
            },
            onisep: {
              description: {
                fr: "Informations lié à la formation issue de l'ONISEP",
                en: "Information related to the training from the ONISEP",
              },
              tags: ["discipline", "domaine_sousdomaine", "intitule", "libelle_poursuite", "lien_site_onisepfr", "url"],
            },
          },
        },
        certification: {
          name: { en: "Certification", fr: "Certification" },
          rows: {
            connue: {
              description: [
                {
                  fr: "Indique si la certification est connue de l'API",
                  en: "Is the certification known?",
                },
                {
                  fr: "Lorsque la certification est connue, alors la certification est disponible dans l'API certifications",
                  en: "When the certification is known, then the certification is available in the certifications API",
                },
                {
                  fr: "Dans le cas contraire, la certification est construite à partir des informations issue du RNCP et du CFD indépendemment.",
                  en: "Otherwise, the certification is built from the information from the RNCP and the CFD independently.",
                },
              ],
            },
            valeur: {
              description: [
                {
                  fr: "Certification associée à la formation",
                  en: "Certification associated with the training",
                },
                {
                  fr: "Pour le détail de la certification, consulter l'onglet `Certification`",
                  en: "For certification details, see the `Certification` tab",
                },
              ],
            },
          },
        },
        session: {
          name: { fr: "Sessions de formation", en: "Training sessions" },
          rows: {
            session: {
              description: [
                {
                  fr: "Une session de formation est définie par une date de début et une date de fin.",
                  en: "A training session is defined by a start date and an end date.",
                },
              ],
              information: {
                fr: "La formation peut contenir des sessions passées, en cours ou à venir.",
                en: "The training can contain past, current or upcoming sessions.",
              },
              tags: ["session.debut", "session.fin", "session.capacite"],
            },
          },
        },
        lieu: {
          name: {
            fr: "Lieu de formation",
            en: "Training location",
          },
          rows: {
            adresse: {
              description: [{ fr: "Adresse du lieu de formation", en: "Training place address" }],
            },
            geolocalisation: {
              description: [
                { fr: "Coordonnées GPS du lieu de formation", en: "GPS coordinates of the training place" },
              ],
            },
            precision: {
              description: [
                {
                  fr: "Précision de la géolocalisation du lieu de formation",
                  en: "Precision of the geolocation of the training place",
                },
                { fr: "La précision est exprimée en mètre", en: "The precision is expressed in meters" },
                {
                  fr: "Il s'agit de la distance entre le point géolocalisé et la locasation déduite de l'adresse",
                  en: "This is the distance between the geolocated point and the location deduced from the address",
                },
              ],
            },
            siret: {
              description: [{ fr: "Numéro SIRET du lieu de formation", en: "Training place SIRET number" }],
            },
            uai: {
              description: [{ fr: "Numéro UAI du lieu de formation", en: "Training place UAI number" }],
            },
          },
        },
        formateur: {
          name: { fr: "Organisme formateur", en: "Training organism" },
          rows: {
            connu: {
              description: [
                {
                  fr: "Indique si le formateur est connu de l'API",
                  en: "Indicates if the trainer is known to the API",
                },
                {
                  fr: "L'organisme est connu lorsqu'il est présent dans [le référentiel des organismes de formation](https://referentiel.apprentissage.onisep.fr/organismes) ou s'il l'a été dans le passé.",
                  en: "The organism is known when it is present in [the training organisms repository](https://referentiel.apprentissage.onisep.fr/organismes) or if it has been in the past.",
                },
                {
                  fr: "Il peut s'agir d'un organisme qui n'est plus sur le référentiel des organismes de formation. Veuillez vérifier le statut de l'organisme.",
                  en: "It can be an organism that is no longer on the training organisms repository. Please check the status of the organism.",
                },
              ],
            },
            organisme: {
              description: [
                {
                  fr: "L'organisme formateur de la formation",
                  en: "The training organism is responsible for providing the training",
                },
                {
                  fr: "L'organisme formateur est en charge du suivi éducatif.",
                  en: "The training organism is responsible for educational monitoring.",
                },
                {
                  fr: "Lorsque l'organisme n'est pas connu, les informations sont récupérées depuis [l'API Entreprise](https://entreprise.api.gouv.fr/). Lorsque le SIRET associé n'est pas retrourvé, est invalide ou non diffusible alors la valeur sera `null`.",
                  en: "When the organism is not known, the information is retrieved from [the Entreprise API](https://entreprise.api.gouv.fr/). When the associated SIRET is not found, is invalid or not distributable then the value will be `null`.",
                },
                {
                  fr: "Pour le détail de l'organisme, consulter l'onglet `Organisme`",
                  en: "For organism details, see the `Organism` tab",
                },
              ],
            },
          },
        },
        responsable: {
          name: { fr: "Organisme responsable", en: "Responsible organism" },
          rows: {
            connu: {
              description: [
                {
                  fr: "Indique si l'organisme est connu de l'API",
                  en: "Indicates if the organism is known to the API",
                },
                {
                  fr: "L'organisme est connu lorsqu'il est présent dans [le référentiel des organismes de formation](https://referentiel.apprentissage.onisep.fr/organismes) ou s'il l'a été dans le passé.",
                  en: "The organism is known when it is present in [the training organisms repository](https://referentiel.apprentissage.onisep.fr/organismes) or if it has been in the past.",
                },
                {
                  fr: "Il peut s'agir d'un organisme qui n'est plus sur le référentiel des organismes de formation. Veuillez vérifier le statut de l'organisme.",
                  en: "It can be an organism that is no longer on the training organisms repository. Please check the status of the organism.",
                },
              ],
            },
            organisme: {
              description: [
                {
                  fr: "L'organisme responsable administratif de la formation",
                  en: "The administrative responsible organism of the training",
                },
                {
                  fr: "Lorsque l'organisme n'est pas connu, les informations sont récupérées depuis [l'API Entreprise](https://entreprise.api.gouv.fr/). Lorsque le SIRET associé n'est pas retrourvé, est invalide ou non diffusible alors la valeur sera `null`.",
                  en: "When the organism is not known, the information is retrieved from [the Entreprise API](https://entreprise.api.gouv.fr/). When the associated SIRET is not found, is invalid or not distributable then the value will be `null`.",
                },
                {
                  fr: "Pour le détail de l'organisme, consulter l'onglet `Organisme`",
                  en: "For organism details, see the `Organism` tab",
                },
              ],
            },
          },
        },
      },
    },
    certificationsPageDoc.data[0],
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
