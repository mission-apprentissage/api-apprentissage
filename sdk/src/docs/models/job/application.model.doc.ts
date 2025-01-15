import type { DocTechnicalField } from "../../types.js";

export const applicationModelDoc = {
  descriptions: [{ en: "Application", fr: "Candidature" }],
  properties: {
    applicant_first_name: {
      descriptions: [{ en: "Applicant's firstname", fr: "Prénom du candidat" }],
    },
    applicant_last_name: {
      descriptions: [{ en: "Applicant's lastname", fr: "Nom du candidat" }],
    },
    applicant_email: {
      descriptions: [{ en: "Applicant's email", fr: "Email du candidat" }],
    },
    applicant_phone: {
      descriptions: [{ en: "Applicant's phone", fr: "Numéro de téléphone du candidat" }],
    },
    applicant_attachment_content: {
      descriptions: [{ en: "Resume file", fr: "CV du candidat" }],
    },
    applicant_attachment_name: {
      descriptions: [{ en: "Resume file name", fr: "Nom du CV" }],
    },
    applicant_message: {
      descriptions: [{ en: "Applicant's message", fr: "Message du candidat" }],
    },
    recipient_id: {
      descriptions: [
        {
          en: "Recipient identifier retrieved from `apply.recipient_id` from search route.",
          fr: "Identifiant du destinataire récupéré de `apply.recipient_id` depuis les resultas de la route de recherche.",
        },
      ],
    },
  },
} as const satisfies DocTechnicalField;
