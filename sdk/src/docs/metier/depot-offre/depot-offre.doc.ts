import type { DocPage, OpenApiText } from "../../types.js";

export const depotOffrePageSummaryDoc = {
  en: "Maximize the visibility of your apprenticeship job offers by posting them on the La bonne alternance platform and its partner sites.",
  fr: "Maximiser la visibilité de vos offres d’emploi en alternance en les diffusant sur la plateforme La bonne alternance ainsi que ses sites partenaires.",
} as OpenApiText;

export const depotOffrePageDoc = {
  description: [
    {
      fr: "**Déposez, modifiez ou supprimez vos offres d’emploi en alternance** pour maximiser leur visibilité en les diffusant sur la plateforme [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) ainsi que ses sites partenaires [view the list](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1).",
      en: "**Post, modify, or delete your apprenticeship job offers** to maximize their visibility by posting them on the [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) platform and its partner sites [consulter la liste](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1).",
    },
    {
      en: "**💡 Using the API allows you to post all your offers at once,** but it is also possible to post a single offer directly on the La bonne alternance site ([accéder au formulaire de dépôt](https://labonnealternance.apprentissage.beta.gouv.fr/espace-pro/creation/entreprise))",
      fr: "**💡 L’utilisation de l’API vous permet de déposer toutes vos offres en une seule fois,** mais il est également possible de déposer une offre unitaire directement sur le site de La bonne alternance ([access the submission form](https://labonnealternance.apprentissage.beta.gouv.fr/espace-pro/creation/entreprise))",
    },
  ],
  frequenceMiseAJour: "daily",
  note: null,
  warning: null,
  type: "data",
  emailDemandeHabilitations: {
    subject: {
      en: "Request for authorization to post apprenticeship job offers",
      fr: "Demande d'habilitation pour le dépôt d'offres d'emploi en alternance",
    },
    body: {
      en: "Hello, I would like to obtain authorization to post apprenticeship job offers on the La bonne alternance platform.",
      fr: "Bonjour, je souhaite obtenir une habilitation pour déposer des offres d'emploi en alternance sur la plateforme La bonne alternance.",
    },
  },
  sources: [
    {
      name: "La bonne alternance",
      logo: { href: "/asset/logo/la_bonne_alternance.png" },
      providers: ["La bonne alternance"],
      href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
    },
  ],
  data: [],
} as const satisfies DocPage;
