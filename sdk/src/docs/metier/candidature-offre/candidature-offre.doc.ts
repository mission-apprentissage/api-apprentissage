import type { DocPage, OpenApiText } from "../../types.js";

export const candidatureOffrePageSummaryDoc = {
  title: {
    fr: "Envoi d’une candidature à une opportunité d’emploi en alternance",
    en: "Send an application to a job opportunity in apprenticeship",
  },
  headline: {
    en: "Streamline your users' journey by directly transmitting your users' applications to recruiters",
    fr: "Fluidifier le parcours de vos utilisateurs en transmettant directement aux recruteurs les candidatures de vos usagers",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const candidatureOffrePageDoc = {
  tag: "job",
  operationIds: ["jobApply"],
  habilitation: "applications:write",
  description: [
    {
      en: "To streamline your users' journey, this API allows you to directly transmit your users' applications to recruiters without them having to leave your site.",
      fr: "Afin de fluidifier le parcours de vos utilisateurs, cette API vous permet de transmettre directement aux recruteurs les candidatures de vos usagers, sans que ces derniers n’aient pas à quitter votre site.",
    },
    {
      en: "For this, it only requires the transmission of the candidate's contact information and resume. A cover letter, addressed to the recruiter, can also be optionally submitted. The application is then sent to the recruiter via email.",
      fr: "Pour cela, elle requiert uniquement la transmission des coordonnées et du CV du candidat. Un message de motivation, à destination du recruteur, peut également être transmis de manière facultative. La candidature est ensuite envoyée au recruteur par email.",
    },
    {
      fr: "Pour utiliser cette API, vous devez d’abord consulter l’API de [recherche d’opportunités d’emploi en alternance](./recherche-offre). Cette dernière vous permettra d’accéder gratuitement en temps réel à l'ensemble des opportunités d'emploi en alternance sur le territoire français. Ensuite, pour chaque opportunité contenant un `apply.recipient_id`, vous pouvez utiliser la présente route d’envoi d’une candidature à cette opportunité d’emploi, en spécifiant `apply.recipient_id` comme destinataire dans les paramètres d’appel.",
      en: "To use this API, you must first query the [alternance job opportunities search API](./recherche-offre). This API allows you to access all the job opportunities in alternance in real time throughout France. Then, for each opportunity with a `apply.recipient_id`, you can use this route to send an application to this job opportunity, specifying `apply.recipient_id` as the recipient in the call parameters.",
    },
  ],
  frequenceMiseAJour: null,
  type: "data",
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
              description: { en: "Applicant's firstname", fr: "Prénom du candidat." },
            },
            applicant_last_name: {
              description: { en: "Applicant's lastname", fr: "Nom du candidat." },
            },
            applicant_email: {
              description: { en: "Applicant's email", fr: "Email du candidat." },
            },
            applicant_phone: {
              description: { en: "Applicant's phone", fr: "Numéro de téléphone du candidat." },
              information: {
                en: "Only European phone numbers are allowed. There is also a check on the nature of the number: only mobile and landline phones are allowed.",
                fr: "Seuls les numéros de téléphone européens sont autorisés. Il y a également une vérification sur la nature du numéro : seuls les téléphones mobiles et fixes sont autorisés.",
              },
            },
          },
        },
        content: {
          name: { en: "Content", fr: "Contenu" },
          rows: {
            applicant_attachment_content: {
              description: {
                en: "Resume file base64 encoded. File content-type and base64 encoding must prefix the Base64 encoded content. Ex : 'data:application/pdf;base64,<base64_encoded_content>'",
                fr: "CV du candidat encodé en base64. Le content-type du fichier et la mention de l'encodage en base64 doivent préfixer le contenu encodé. Ex : 'data:application/pdf;base64,<contenu_encodé_base64>'",
              },
              information: {
                en: "The file must be base64 encoded and only PDF and DOCX format are allowed. File size must be under 3MB. File content-type and base64 encoding must prefix the Base64 encoded content. Ex : data:application/pdf;base64,<base64_encoded_content>",
                fr: "Le CV doit être encodé en base64, et seuls les formats PDF et DOCX sont autorisés. La taille du fichier ne doit pas dépasser 3 Mo. Le content-type du fichier et la mention de l'encodage en Base64 doivent préfixer le contenu encodé. Ex : data:application/pdf;base64,<contenu_encodé_base64>",
              },
            },
            applicant_attachment_name: {
              description: { en: "Resume file name", fr: "Nom du CV." },
            },
          },
        },
        recipient: {
          name: { en: "Recipient", fr: "Destinataire." },
          rows: {
            recipient_id: {
              description: {
                en: "Recipient identifier retrieved from `apply.recipient_id` from search route results of the [alternance job opportunities search route](./recherche-offre).",
                fr: "Identifiant du destinataire récupéré de `apply.recipient_id` depuis les résultats de la route de la [route de recherche d’opportunités d’emploi en alternance](./recherche-offre).",
              },
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
