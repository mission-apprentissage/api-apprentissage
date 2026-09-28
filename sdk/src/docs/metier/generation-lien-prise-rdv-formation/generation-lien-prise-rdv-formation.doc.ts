import type { DocPage, OpenApiText } from "../../types.js"

export const generationLienPriseRdvFormationPageSummaryDoc = {
  title: {
    en: "Contact a training center via a dedicated link",
    fr: "Contacter un centre de formation via un lien dédié",
  },
  headline: {
    en: "Generate links for appointment requests for training via the La bonne alternance service",
    fr: "Obtenir un lien d’accès à un formulaire de prise de rendez-vous auprès d’un centre de formation",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText }

export const generationLienPriseRdvFormationPageDoc = {
  tag: "formation",
  operationIds: ["generateFormationAppointmentLink", "get_formation_v1_appointment_links"],
  habilitation: "appointments:write",
  description: [
    {
      fr: "Récupère un lien d’accès à un formulaire de prise de rendez-vous auprès d’un centre de formation.",
      en: "Generate a training appointment request link",
    },
    {
      fr: "Le lien récupéré est à mettre à disposition de vos usagers pour leur permettre de contacter le centre de formation proposant des formations qui les intéressent.",
      en: "The retrieved link should be made available to your users so they can contact the training center offering the courses they are interested in.",
    },
    {
      fr: "**Vous devez fournir un identifiant de formation**, qui peut être un identifiant Parcoursup, ONISEP ou une clé ministère éducatif.",
      en: "**You must provide a training identifier**, which can be a Parcoursup, ONISEP or Ministry of Education key",
    },
    {
      fr: "La clé ministère éducatif peut être récupérée via la route de [recherche de formations en apprentissage](./recherche-formation).",
      en: "The Ministry of Education key can be retrieved via the [search for apprenticeship training](./recherche-formation) route",
    },
    {
      fr: "Parcoursup, Affelnet et ONISEP peuvent récupérer en un seul appel les liens de toutes leurs formations ouvertes à la prise de rendez-vous, avec pour chacune un lien de recherche d'entreprises La bonne alternance.",
      en: "Parcoursup, Affelnet and ONISEP can retrieve in a single call the links of all their trainings open to appointment requests, each with a La bonne alternance company search link.",
    },
  ],
  frequenceMiseAJour: null,
  type: "outil",
  sources: [
    {
      name: "La bonne alternance",
      logo: { href: "/asset/logo/la_bonne_alternance.png" },
      providers: ["La bonne alternance"],
      href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
    },
  ],
  data: [
    {
      name: { fr: "Résultat", en: "Result" },
      sections: {
        success: {
          name: { fr: "Succès", en: "Success" },
          rows: {
            form_url: {
              description: [
                {
                  fr: "Lien vers le formulaire de prise de rendez-vous pour la formation sur le service La bonne alternance.",
                  en: "Appointment request link for the training on the La bonne alternance service",
                },
              ],
              information: {
                fr: "Le lien est généré uniquement si l'établissement permet la prise de rendez-vous en ligne. Sinon, une erreur est retournée.",
                en: "The link is generated only if the establishment allows online appointment scheduling. Otherwise, the result will be an error.",
              },
            },
            formation: {
              description: [
                {
                  fr: "Informations liées à la formation.",
                  en: "Various information about the training",
                },
              ],
              tags: ["intitule_long", "cfd", "cle_ministere_educatif"],
            },
            formateur: {
              description: [
                {
                  fr: "Informations liées à l'établissement formateur.",
                  en: "Various information about the training establishment",
                },
              ],
              tags: ["etablissement_formateur_entreprise_raison_sociale", "etablissement_formateur_siret"],
            },
            lieu: {
              description: [
                {
                  fr: "Informations liées au lieu de formation.",
                  en: "Various information about the training location",
                },
              ],
              tags: ["lieu_formation_adresse", "code_postal", "localite"],
            },
          },
        },
        error: {
          name: { fr: "Erreur", en: "Error" },
          rows: {
            error: {
              description: [{ fr: "Détail du message d'erreur s'il est présent.", en: "The error message" }],
            },
          },
        },
      },
    },
    {
      name: { fr: "Liens de toutes les formations", en: "Links for all trainings" },
      sections: {
        success: {
          name: null,
          rows: {
            id: {
              description: [
                {
                  fr: "Identifiant de la formation dans votre système (Parcoursup, clé ministère éducatif pour Affelnet, identifiant d'action IDEO2 pour ONISEP).",
                  en: "Training identifier in your system (Parcoursup, Ministry of Education key for Affelnet, IDEO2 action identifier for ONISEP).",
                },
              ],
            },
            url_rdva: {
              description: [{ fr: "Lien vers le formulaire de prise de rendez-vous.", en: "Appointment request form link." }],
            },
            url_emploi: {
              description: [
                {
                  fr: "Lien de recherche d'entreprises pour le métier de la formation, autour du lieu de formation.",
                  en: "Company search link for the training's occupation, around the training location.",
                },
              ],
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage
