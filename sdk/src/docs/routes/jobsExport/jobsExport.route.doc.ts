import type { DocRoute } from "../../types.js";

export const jobsExportRouteDoc = {
  summary: { fr: "Export des offres d'emploi", en: "Export of the job offers" },
  description: {
    en: `Displays all job offers.
<br/>Offers are updated once a day at 3 AM Paris time.`,
    fr: `Expose la totalité des offres d'emploi.
<br/>Les offres sont mises à jour une fois par jour à 3h du matin heure de Paris.`,
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
