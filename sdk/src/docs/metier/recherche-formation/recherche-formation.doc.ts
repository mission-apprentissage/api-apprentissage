import type { DocPage, OpenApiText } from "../../types.js"
import { certificationsPageDoc } from "../certifications/certifications.doc.js"
import { rechercheCommunePageDoc } from "../recherche-commune/recherche-commune.doc.js"
import { recuperationOrganismesPageDoc } from "../recuperation-organismes/recuperation-organismes.doc.js"

export const rechercheFormationPageSummaryDoc = {
  title: {
    en: "Search for training courses in apprenticeship",
    fr: "Recherche de formations en apprentissage",
  },
  headline: {
    fr: "Accéder gratuitement à l’ensemble des formations disponibles en apprentissage",
    en: "Access free access to all training programs available through apprenticeships",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText }

export const rechercheFormationPageDoc = {
  tag: "formation",
  operationIds: ["get_formation_v1_search"],
  habilitation: null,
  description: [
    {
      fr: "**Accéder gratuitement à l'ensemble des formations en apprentissage disponibles sur le territoire français.** ",
      en: "**Access all training courses available in apprenticeship for free on the French territory.** ",
    },
    {
      fr: "Les formations retournées sont celles collectées par [le catalogue des formations en apprentissage](https://catalogue-apprentissage.intercariforef.org/recherche/formations) **du réseau des Carif-Oref.**",
      en: "The returned training courses are those collected by [the apprenticeship training catalog](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
    },
    {
      fr: "**💡 Vous pouvez rechercher dans l’ensemble des formations selon les critères suivants : Code(s) ROME, Code(s) RNCP, géolocalisation, niveau de diplôme et rayon de recherche.**",
      en: "**💡 You can search for all job training courses according to the following criteria: ROME code(s), RNCP code(s), geolocation, diploma level and search radius.**",
    },
    {
      fr: "Les résultats sont retournés par distance croissante au lieu de recherche si ce dernier a été fourni.",
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
    ...recuperationOrganismesPageDoc.sources,
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
                  fr: "Identifiant unique de la formation sur [le catalogue des formations en apprentissage](https://catalogue-apprentissage.intercariforef.org/recherche/formations).",
                  en: "Unique training identifier on [the apprenticeship training catalog](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
                },
              ],
              information: {
                en: "This catalog is produced by RCO (the Carif-Oref network), which is responsible for nationally aggregating the training offer collected regionally by the Carif-Oref.",
                fr: "Ce catalogue est produit par RCO (le réseau des Carif-Oref), qui se charge de collecter au niveau national l'offre de formation collectée régionalement par les Carif-Oref.",
              },
              tags: ["cle_ministere_educatif"],
            },
            statut: {
              description: [
                { fr: "Statut de la formation.", en: "Training status" },
                { fr: "Les valeurs possibles sont : ", en: "Possible values are: " },
                {
                  fr: "- `publié` pour les formations publiées sur le catalogue.",
                  en: "for published training courses",
                },
                {
                  fr: "- `archivé` pour les anciennes formations du catalogue.",
                  en: "for old training courses in the catalog",
                },
                {
                  fr: "- `supprimé` pour les formations supprimées du catalogue.",
                  en: "for training courses deleted from the catalogue",
                },
              ],
            },
            contact: {
              description: [
                {
                  fr: "Coordonnées de contact du lieu de formation.",
                  en: "Contact details of the training location.",
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
                { fr: "Modalités de la formation composées de :", en: "Training modality" },
                {
                  fr: "- L'année de démarrage de la session de formation.",
                  en: "The start year of the training session.",
                },
                { fr: "- La durée indicative de la formation.", en: "The indicative duration of the training" },
                { fr: "- Si la formation est entièrement à distance.", en: "If the training is entirely remote" },
                { fr: "- Le code MEF 10 de la formation.", en: "The training MEF 10 code" },
              ],
              tags: ["annee_cycle", "duree_indicative", "entierement_a_distance", "mef_10"],
            },
            onisep: {
              description: {
                fr: "Informations liées à la formation issues de l'ONISEP.",
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
                  fr: "Indique si la certification est connue de l'API Liste des Certifications Professionnelles [ici](https://api.apprentissage.beta.gouv.fr/fr/explorer/certifications).",
                  en: "Indicates whether the certification is recognized by the API List of Professional Certifications [here](https://api.apprentissage.beta.gouv.fr/fr/explorer/certifications).",
                },
                {
                  fr: "Dans le cas contraire, la certification est construite à partir des informations issues du RNCP et du CFD indépendamment.",
                  en: "Otherwise, the certification is built from the information from the RNCP and the CFD independently.",
                },
              ],
            },
            valeur: {
              description: [
                {
                  fr: "Certification associée à la formation.",
                  en: "Certification associated with the training.",
                },
                {
                  fr: "Pour plus de détail sur la certification, consulter l'onglet ``Certification``.",
                  en: "For certification details, see the `Certification` tab.",
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
                  fr: "Une session est caractérisée par une date de début, une date de fin, ainsi qu’une capacité d’accueil en nombre d’élèves.",
                  en: "A session is defined by a start date, an end date, and a maximum number of students it can accommodate.",
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
              description: [{ fr: "Adresse du lieu de formation.", en: "Training place address" }],
            },
            geolocalisation: {
              description: [{ fr: "Coordonnées GPS du lieu de formation.", en: "GPS coordinates of the training place" }],
            },
            precision: {
              description: [
                {
                  fr: "Précision de la géolocalisation du lieu de formation en mètres.",
                  en: "Geolocation accuracy of the training location in meters.",
                },
                {
                  fr: "Il s'agit de la distance entre le point géolocalisé et la localisation déduite de l'adresse.",
                  en: "This is the distance between the geolocated point and the location deduced from the address.",
                },
              ],
            },
            siret: {
              description: [{ fr: "Numéro SIRET du lieu de formation.", en: "Training place SIRET number." }],
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
                  fr: "Vaut true s’il est ou a été présent dans [le référentiel des organismes de formation](https://referentiel.apprentissage.onisep.fr/organismes).",
                  en: "Returns true if it is or has been listed in the [the training organisms repository](https://referentiel.apprentissage.onisep.fr/organismes).",
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
                  fr: "Informations relatives à l’organisme formateur, en charge du suivi éducatif.",
                  en: "The training organism is responsible for educational monitoring.",
                },
                {
                  fr: "Lorsque l'organisme est inconnu, les informations sont récupérées depuis [l'API Entreprise](https://entreprise.api.gouv.fr/). Lorsque le SIRET associé n'est pas retrouvé, est invalide ou non diffusible alors la valeur sera `null`.",
                  en: "When the organism is unknown, the information is retrieved from [the Entreprise API](https://entreprise.api.gouv.fr/). When the associated SIRET is not found, is invalid or not distributable then the value will be `null`.",
                },
                {
                  fr: "Pour plus de détails sur l'organisme, consulter l'onglet ``Organisme``.",
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
                  fr: "Vaut TRUE si présent dans [le référentiel des organismes de formation](https://referentiel.apprentissage.onisep.fr/organismes) ou s'il l'a été dans le passé.",
                  en: "TRUE when it is present in [the training organisms repository](https://referentiel.apprentissage.onisep.fr/organismes) or if it has been in the past.",
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
                  fr: "Informations relatives à l’organisme responsable administrativement de la formation.",
                  en: "The administrative responsible organism of the training",
                },
                {
                  fr: "Lorsque l'organisme est inconnu, les informations sont récupérées depuis [l'API Entreprise](https://entreprise.api.gouv.fr/). Lorsque le SIRET associé n'est pas retrouvé, est invalide ou non diffusible alors la valeur sera `null`.",
                  en: "When the organism is unknown, the information is retrieved from [the Entreprise API](https://entreprise.api.gouv.fr/). When the associated SIRET is not found, is invalid or not distributable then the value will be `null`.",
                },
                {
                  fr: "Pour le détail de l'organisme, consulter l'onglet `Organisme`.",
                  en: "For organism details, see the `Organism` tab",
                },
              ],
            },
          },
        },
      },
    },
    certificationsPageDoc.data[0],
    recuperationOrganismesPageDoc.data[0],
  ],
} as const satisfies DocPage
