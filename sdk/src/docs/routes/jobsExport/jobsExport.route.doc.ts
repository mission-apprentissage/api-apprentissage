import type { DocRoute } from "../../types.js";

export const jobsExportRouteDoc = {
  summary: { fr: "Export des offres d'emploi", en: "Export of the job offers" },
  description: {
    en: `Lists all job opportunities (job postings and companies to which you can send unsolicited applications).
<br/>Opportunities are updated once a day at 3:00 AM Paris time.`,
    fr: `Expose la totalité des opportunités d'emploi (offres et entreprises auprès desquelles adresser des candidatures spontanées).
<br/>Les opportunités sont mises à jour une fois par jour à 3h du matin heure de Paris.`,
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: [
        {
          en: "Link to the offers.",
          fr: "Lien vers les offres.",
        },
      ],
    },
  },
} as const satisfies DocRoute;
