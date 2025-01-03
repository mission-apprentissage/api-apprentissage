import type { DataSource, DocModel } from "../../types.js";
const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png" },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const applicationModelDoc = {
  name: "Application",
  description: { en: "Application", fr: "Candidature" },
  sources,
  sections: {
    applicant: {
      name: { en: "Applicant", fr: "Candidat" },
      _: {
        applicant_first_name: {
          metier: true,
          description: { en: "Applicant's firstname", fr: "Prénom du candidat" },
        },
        applicant_last_name: {
          metier: true,
          description: { en: "Applicant's lastname", fr: "Nom du candidat" },
        },
        applicant_email: {
          metier: true,
          description: { en: "Applicant's email", fr: "Email du candidat" },
        },
        applicant_phone: {
          metier: true,
          description: { en: "Applicant's phone", fr: "Numéro de téléphone du candidat" },
        },
      },
    },
    content: {
      name: { en: "Content", fr: "Contenu" },
      _: {
        applicant_attachment_content: {
          metier: true,
          description: { en: "Resume file", fr: "CV du candidat" },
          tip: {
            title: { en: "File restrictions", fr: "Contraintes sur le fichier" },
            content: {
              en: "The file must be base64 encoded and only PDF and DOCX format are allowed. File size must be under 3MB.",
              fr: "Le CV encodé en base64, et seul les formats PDF et DOCX sont autorisés. La taille du fichier ne doit pas dépasser 3Mo.",
            },
          },
        },
        applicant_attachment_name: {
          metier: true,
          description: { en: "Resume file name", fr: "Nom du CV" },
        },
      },
    },
    recipient: {
      name: { en: "Recipient", fr: "Destinataire" },
      _: {
        recipient_id: {
          metier: true,
          description: {
            en: "Recipient identifier retrieved from `apply.recipient_id` from search route.",
            fr: "Identifiant du destinataire récupéré de `apply.recipient_id` depuis les resultas de la route de recherche.",
          },
        },
      },
    },
  },
} as const satisfies DocModel;
