import type { DocTechnicalField } from "../../types.js"

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
    applicant_inscription_formation: {
      descriptions: [
        {
          en: "Whether the applicant is already enrolled in a training programme. The three fields below are only relevant when it is true.",
          fr: "Indique si le candidat est déjà inscrit en formation. Les trois champs ci-dessous n'ont de sens que lorsqu'il vaut true.",
        },
      ],
      examples: [true, false],
    },
    applicant_formation_description: {
      descriptions: [
        {
          en: "Free text describing the applicant's school and training programme.",
          fr: "Texte libre décrivant l'école et la formation suivie par le candidat.",
        },
      ],
      examples: ["IUT de Rennes / BUT Informatique / Rennes"],
    },
    applicant_rythm_description: {
      descriptions: [
        {
          en: "Free text describing the school/company rhythm of the applicant's training programme.",
          fr: "Texte libre décrivant le rythme école/entreprise de la formation du candidat.",
        },
      ],
      examples: ["1 semaine à l'école / 2 semaines en entreprise"],
    },
    applicant_contract_duration: {
      descriptions: [
        {
          en: "Contract duration wished by the applicant, as a label.",
          fr: "Durée de contrat souhaitée par le candidat, sous forme de libellé.",
        },
      ],
      examples: ["12 mois"],
    },
    applicant_contract_start: {
      descriptions: [
        {
          en: "Start periods wished by the applicant, as labels. Several periods can be given.",
          fr: "Périodes de démarrage souhaitées par le candidat, sous forme de libellés. Plusieurs périodes peuvent être indiquées.",
        },
      ],
      items: {
        descriptions: [{ en: "Start period wished by the applicant", fr: "Période de démarrage souhaitée par le candidat" }],
        examples: ["Dès que possible", "Septembre 2026"],
      },
    },
    applicant_answers_to_recruiter_questions: {
      descriptions: [
        {
          en: "Applicant's answers to the questions of the offer, found in `offer.to_applicant_questions`.",
          fr: "Réponses du candidat aux questions de l'offre, présentes dans `offer.to_applicant_questions`.",
        },
        {
          en: "Optional, even when the offer asks questions. When provided, each `question` must exactly match one of the offer questions, otherwise the application is rejected.",
          fr: "Facultatif, même lorsque l'offre pose des questions. Si des réponses sont fournies, chaque `question` doit correspondre exactement à une question de l'offre, sinon la candidature est refusée.",
        },
        {
          en: "A given question can only be answered once: sending the same `question` twice is rejected.",
          fr: "Une même question ne peut recevoir qu'une seule réponse : envoyer deux fois la même `question` est refusé.",
        },
      ],
      items: {
        descriptions: [{ en: "Answer to one question of the offer", fr: "Réponse à une question de l'offre" }],
        properties: {
          question: {
            descriptions: [{ en: "Question of the offer, copied verbatim", fr: "Question de l'offre, reprise à l'identique" }],
            examples: ["Pourquoi souhaitez-vous rejoindre notre entreprise ?"],
          },
          answer: {
            descriptions: [{ en: "Applicant's answer", fr: "Réponse du candidat" }],
            examples: ["Votre engagement sur les mobilités douces correspond à ce que je veux faire."],
          },
        },
      },
    },
  },
} as const satisfies DocTechnicalField
