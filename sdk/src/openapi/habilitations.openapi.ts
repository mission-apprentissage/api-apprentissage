import type { OpenApiText } from "../docs/types.js"
import { CONTACT_EMAIL } from "../utils/contact.js"
import type { DemandeHabilitation, OpenapiHabilitation } from "./types.js"

export const accesHabilitationsSectionOpenapi = {
  title: { fr: "Accès et habilitations", en: "Access and habilitations" },
  // Ancre générée par Redoc pour un titre de niveau 1 de l'intro : `section/${safeSlugify(title)}`.
  // Re-dérivée depuis Redoc par le test « accesHabilitationsSectionOpenapi » de l'UI
  anchor: { fr: "section/Acces-et-habilitations", en: "section/Access-and-habilitations" },
} as const satisfies { title: OpenApiText; anchor: OpenApiText }

export const demandeHabilitationsOpenapi = {
  "jobs:write": {
    label: { fr: "Dépôt et modification d'offres d'emploi", en: "Posting and updating job offers" },
    subject: {
      en: "Request for authorization to post apprenticeship job offers",
      fr: "Demande d'habilitation pour le dépôt d'offres d'emploi en alternance",
    },
    body: {
      en: "Hello,\n\nI would like to obtain authorization to post apprenticeship job offers on the La bonne alternance platform.\n\nOrganisation:\nIntended use:",
      fr: "Bonjour,\n\nJe souhaite obtenir une habilitation pour déposer des offres d'emploi en alternance sur la plateforme La bonne alternance.\n\nOrganisation :\nUsage visé :",
    },
    restriction: null,
  },
  "applications:write": {
    label: { fr: "Envoi de candidatures", en: "Sending applications" },
    subject: {
      en: "Request for authorization to send applications to apprenticeship job opportunities",
      fr: "Demande d'habilitation pour l'envoi de candidature aux opportunités d'emploi en alternance",
    },
    body: {
      en: "Hello,\n\nI would like to obtain authorization to send applications to apprenticeship job opportunities on the La bonne alternance platform.\n\nOrganisation:\nIntended use:",
      fr: "Bonjour,\n\nJe souhaite obtenir une habilitation pour envoyer des candidatures à des offres d'emploi en alternance sur la plateforme La bonne alternance.\n\nOrganisation :\nUsage visé :",
    },
    restriction: null,
  },
  "appointments:write": {
    label: { fr: "Liens de prise de rendez-vous avec les centres de formation", en: "Appointment links with training centers" },
    subject: {
      en: "Request for authorization to generate appointment links with training centers",
      fr: "Demande d'habilitation pour la génération de lien de rendez-vous avec les centres de formation",
    },
    body: {
      en: "Hello,\n\nI would like to obtain authorization to generate appointment request links with training centers on the La bonne alternance platform.\n\nOrganisation:\nIntended use:",
      fr: "Bonjour,\n\nJe souhaite obtenir une habilitation pour générer des liens de prise de rendez-vous avec les centres de formation sur la plateforme La bonne alternance.\n\nOrganisation :\nUsage visé :",
    },
    // Contrôle porté par La bonne alternance sur l'organisation du token, sandbox compris
    // (côté labonnealternance : isValidReferrerApi, APPOINTMENT_LINKS_REFERRERS)
    restriction: {
      fr: "Réservée aux organisations partenaires de la prise de rendez-vous (Parcoursup, Affelnet, ONISEP et 1 jeune 1 solution selon la route) : une clé sandbox ne lève pas cette restriction.",
      en: "Restricted to appointment partner organisations (Parcoursup, Affelnet, ONISEP and 1 jeune 1 solution depending on the route): a sandbox key does not lift this restriction.",
    },
  },
} as const satisfies Record<OpenapiHabilitation, DemandeHabilitation>

export function isOpenapiHabilitation(value: string): value is OpenapiHabilitation {
  return Object.hasOwn(demandeHabilitationsOpenapi, value)
}

export function getDemandeHabilitationMailto(habilitation: OpenapiHabilitation, lang: "en" | "fr"): string {
  const { subject, body } = demandeHabilitationsOpenapi[habilitation]

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject[lang])}&body=${encodeURIComponent(body[lang])}`
}
