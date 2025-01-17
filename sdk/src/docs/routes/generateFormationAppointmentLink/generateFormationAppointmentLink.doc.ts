import { generationLienPriseRdvFormationPageSummaryDoc } from "../../metier/generation-lien-prise-rdv-formation/generation-lien-prise-rdv-formation.doc.js";
import type { DocRoute } from "../../types.js";

export const generateFormationAppointmentLinkRouteDoc = {
  summary: generationLienPriseRdvFormationPageSummaryDoc.title,
  description: generationLienPriseRdvFormationPageSummaryDoc.headline,
  body: {
    description: {
      fr: "Identifiant de la formation",
      en: "Training identifier",
    },
    content: {
      descriptions: null,
      oneOf: [
        {
          descriptions: [{ fr: "Identifiant Parcoursup de la formation", en: "Parcoursup identifier of the training" }],
          properties: {
            parcoursup_id: {
              descriptions: null,
            },
          },
        },
        {
          descriptions: [{ fr: "Identifiant ONISEP de la formation", en: "ONISEP identifier of the training" }],
          properties: {
            onisep_id: {
              descriptions: [
                {
                  en: null,
                  fr: "Identifiant ONISEP utilisé avec le mapping de la collection referentielonisep",
                },
              ],
            },
          },
        },
        {
          descriptions: [
            {
              fr: "Identifiant unique de la formation au sein du ministère de l'éducation",
              en: "Unique identifier of the training within the Ministry of Education",
            },
          ],
          properties: {
            cle_ministere_educatif: {
              descriptions: null,
            },
          },
        },
      ],
    },
  },
  response: {
    description: {
      en: "Response",
      fr: "Réponse",
    },
    content: {
      descriptions: null,
      oneOf: [
        {
          descriptions: [{ fr: "Résultat en cas de succès", en: "Success result" }],
          properties: {
            etablissement_formateur_entreprise_raison_sociale: {
              descriptions: [
                {
                  en: "Training organism name",
                  fr: "Raison social de l'établissement formateur",
                },
              ],
            },
            intitule_long: {
              descriptions: [
                {
                  en: "Long title of the training",
                  fr: "Intitulé long de la formation",
                },
              ],
            },
            lieu_formation_adresse: {
              descriptions: [
                {
                  en: "Training location address",
                  fr: "Adresse du lieu de formation",
                },
              ],
            },
            code_postal: {
              descriptions: [
                {
                  en: "Training location postal code",
                  fr: "Code postal du lieu de formation",
                },
              ],
            },
            etablissement_formateur_siret: {
              descriptions: [
                {
                  en: "SIRET number of the training establishment",
                  fr: "Le numéro de SIRET de l'établissement",
                },
              ],
              examples: ["78424186100011"],
            },
            cfd: {
              descriptions: [
                {
                  en: "Training course code",
                  fr: "Code formation diplôme de la formation",
                },
              ],
            },
            localite: {
              descriptions: [
                {
                  en: "Training location locality",
                  fr: "Localité du lieu de formation",
                },
              ],
            },
            cle_ministere_educatif: {
              descriptions: [
                {
                  en: "Unique identifier of the training within the Ministry of Education",
                  fr: "Identifiant unique de la formation au sein du ministère de l'éducation",
                },
              ],
            },
            form_url: {
              descriptions: [
                {
                  en: "Appointment request link La bonne alternance",
                  fr: "Lien de prise de rendez-vous La bonne alternance",
                },
              ],
            },
          },
        },
        {
          descriptions: [
            {
              fr: "Résultat en cas d'erreur",
              en: "Error result",
            },
          ],
          properties: {
            error: {
              descriptions: null,
            },
          },
        },
      ],
    },
  },
} as const satisfies DocRoute;
