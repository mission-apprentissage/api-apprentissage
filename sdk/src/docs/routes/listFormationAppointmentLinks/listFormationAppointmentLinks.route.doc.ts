import type { DocRoute } from "../../types.js"

export const listFormationAppointmentLinksRouteDoc = {
  summary: {
    fr: "Liens de prise de rendez-vous et de recherche d'entreprises de toutes vos formations",
    en: "Appointment and company search links for all your trainings",
  },
  description: {
    fr: `Renvoie en un seul appel, pour chaque formation ouverte à la prise de rendez-vous pour votre organisation, le lien de prise de rendez-vous et le lien de recherche d'entreprises La bonne alternance.
<br/>Réservé à Parcoursup, Affelnet et ONISEP : l'organisation rattachée à votre clé d'API détermine l'identifiant renvoyé et le suivi des liens. Toute autre organisation reçoit **403**, y compris avec une clé sandbox, qui reprend l'organisation de votre compte.<br /><br />**Limite de débit** : 2 appels par minute, par consommateur.`,
    en: `Returns in a single call, for each training open to appointment requests for your organisation, the La bonne alternance appointment request link and company search link.
<br/>Restricted to Parcoursup, Affelnet and ONISEP: the organisation of your API key determines the returned identifier and the link tracking. Any other organisation gets **403**, sandbox keys included, since they carry your account's organisation.<br /><br />**Rate limit**: 2 calls per minute, per consumer.`,
  },
  response: {
    description: { fr: "Succès", en: "Success" },
    content: {
      descriptions: null,
      properties: {
        data: {
          descriptions: [{ fr: "Formations ouvertes à la prise de rendez-vous pour votre organisation", en: "Trainings open to appointment requests for your organisation" }],
          items: {
            descriptions: null,
            properties: {
              id: {
                descriptions: [
                  {
                    fr: "Identifiant de la formation dans votre système : identifiant Parcoursup pour Parcoursup, clé ministère éducatif pour Affelnet, identifiant d'action IDEO2 pour ONISEP. Un identifiant ONISEP qui couvre plusieurs formations apparaît sur plusieurs lignes.",
                    en: "Training identifier in your system: Parcoursup identifier for Parcoursup, Ministry of Education key for Affelnet, IDEO2 action identifier for ONISEP. An ONISEP identifier covering several trainings appears on several rows.",
                  },
                ],
                examples: ["10013"],
              },
              url_rdva: {
                descriptions: [
                  {
                    fr: "Lien vers le formulaire de prise de rendez-vous La bonne alternance, identique au `form_url` de la génération unitaire",
                    en: "La bonne alternance appointment request form link, identical to the `form_url` of the single-training route",
                  },
                ],
                examples: [
                  "https://labonnealternance.apprentissage.beta.gouv.fr/rdva?referrer=parcoursup&cleMinistereEducatif=088281P01313885594860007038855948600070-67118%23L01",
                ],
              },
              url_emploi: {
                descriptions: [
                  {
                    fr: "Lien de recherche d'entreprises La bonne alternance pour le métier de la formation, autour du lieu de formation",
                    en: "La bonne alternance company search link for the training's occupation, around the training location",
                  },
                ],
                examples: [
                  "https://labonnealternance.apprentissage.beta.gouv.fr/recherche?mode=emplois&q=Boulangerie+-+viennoiserie&lieu_label=Tremblay-en-France&latitude=48.98&longitude=2.56&radius=60&search_source=partner_links&utm_source=parcoursup",
                ],
              },
            },
          },
        },
      },
    },
  },
} as const satisfies DocRoute
