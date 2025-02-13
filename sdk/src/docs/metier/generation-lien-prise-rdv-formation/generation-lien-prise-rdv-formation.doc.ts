import type { DocPage, OpenApiText } from "../../types.js";

export const generationLienPriseRdvFormationPageSummaryDoc = {
  title: {
    en: "Generate a training appointment request link",
    fr: "Génération d'un lien de prise de rendez-vous pour une formation",
  },
  headline: {
    en: "Generate links for appointment requests for training via the La bonne alternance service",
    fr: "Générer des liens pour la prise de rendez-vous pour une formation via le service La bonne alternance",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const generationLienPriseRdvFormationPageDoc = {
  tag: "formation",
  operationIds: ["generateFormationAppointmentLink"],
  habilitation: "appointments:write",
  description: [
    {
      fr: "Génère un lien de prise de rendez-vous pour une formation",
      en: "Generate a training appointment request link",
    },
    {
      fr: "Le lien généré permet de prendre rendez-vous pour une formation via le service La bonne alternance",
      en: "The generated link allows you to make an appointment for training via the La bonne alternance service",
    },
    {
      fr: "**Vous devez fournir un identifiant de formation**, qui peut être un identifiant Parcoursup, ONISEP ou une clé ministere educatif",
      en: "**You must provide a training identifier**, which can be a Parcoursup, ONISEP or Ministry of Education key",
    },
    {
      fr: "La clé ministere educatif peut etre récupéré via la route de [recherche de formations en apprentissage](./recherche-formation)",
      en: "The Ministry of Education key can be retrieved via the [search for apprenticeship training](./recherche-formation) route",
    },
  ],
  frequenceMiseAJour: null,
  type: "outil",
  sources: [
    {
      name: "La bonne alternance",
      logo: { href: "/asset/logo/labonnealternance.svg" },
      providers: ["La bonne alternance"],
      href: "https://labonnealternance.pole-emploi.fr/",
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
                  fr: "Lien de prise de rendez-vous pour la formation sur le service La bonne alternance",
                  en: "Appointment request link for the training on the La bonne alternance service",
                },
              ],
              information: {
                fr: "Le lien est généré uniquement si l'établissement autorise la prise de rendez-vous en ligne. Dans le cas contraire, le résultat sera une erreur.",
                en: "The link is generated only if the establishment allows online appointment scheduling. Otherwise, the result will be an error.",
              },
            },
            formation: {
              description: [
                {
                  fr: "Diverses informations sur la formation",
                  en: "Various information about the training",
                },
              ],
              tags: ["intitule_long", "cfd", "cle_ministere_educatif"],
            },
            formateur: {
              description: [
                {
                  fr: "Diverses informations sur l'établissement formateur",
                  en: "Various information about the training establishment",
                },
              ],
              tags: ["etablissement_formateur_entreprise_raison_sociale", "etablissement_formateur_siret"],
            },
            lieu: {
              description: [
                {
                  fr: "Diverses informations sur le lieu de formation",
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
              description: [{ fr: "Le message d'erreur", en: "The error message" }],
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
