import type { DocPage, OpenApiText } from "../../types.js";

export const candidatureOffrePageSummaryDoc = {
  en: "Streamline your users' journey by directly transmitting your users' applications to recruiters.",
  fr: "Fluidifier le parcours de vos utilisateurs en transmettant directement aux recruteurs les candidatures de vos usagers.",
} as OpenApiText;

export const candidatureOffrePageDoc = {
  description: [
    {
      en: "To streamline your users' journey, this API allows you to directly transmit your users' applications to recruiters without them having to leave your site.",
      fr: "Afin de fluidifier le parcours de vos utilisateurs, cette API vous permet de transmettre directement aux recruteurs les candidatures de vos usagers, sans que ces derniers n’aient à quitter votre site.",
    },
    {
      en: "For this, it only requires the transmission of the candidate's contact information and resume. A cover letter, addressed to the recruiter, can also be optionally submitted. The application is then sent to the recruiter via email.",
      fr: "Pour cela, elle requiert seulement la transmission des coordonnées ainsi que du CV du candidat. Un message de motivation, à destination du recruteur, peut également être transmis de manière facultative. La candidature est ensuite envoyée au recruteur par email.",
    },
  ],
  frequenceMiseAJour: "daily",
  type: "data",
  emailDemandeHabilitations: null,
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
      name: { en: "Job application", fr: "Candidature" },
      sections: {
        applicant: {
          name: { en: "Applicant", fr: "Candidat" },
          rows: {
            applicant_first_name: {
              description: { en: "Applicant's firstname", fr: "Prénom du candidat" },
            },
            applicant_last_name: {
              description: { en: "Applicant's lastname", fr: "Nom du candidat" },
            },
            applicant_email: {
              description: { en: "Applicant's email", fr: "Email du candidat" },
            },
            applicant_phone: {
              description: { en: "Applicant's phone", fr: "Numéro de téléphone du candidat" },
            },
          },
        },
        content: {
          name: { en: "Content", fr: "Contenu" },
          rows: {
            applicant_attachment_content: {
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
              description: { en: "Resume file name", fr: "Nom du CV" },
            },
          },
        },
        recipient: {
          name: { en: "Recipient", fr: "Destinataire" },
          rows: {
            recipient_id: {
              description: {
                en: "Recipient identifier retrieved from `apply.recipient_id` from search route.",
                fr: "Identifiant du destinataire récupéré de `apply.recipient_id` depuis les resultas de la route de recherche.",
              },
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
