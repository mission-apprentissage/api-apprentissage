import type { DocPage, OpenApiText } from "../../types.js";
import { rechercheOffrePageDoc } from "../recherche-offre/recherche-offre.doc.js";
import applyDescEn from "./en/apply.description.md.js";
import applyDescFr from "./fr/apply.description.md.js";

export const depotOffrePageSummaryDoc = {
  title: {
    fr: "Dépôt d’offres d’emploi en alternance",
    en: "Submit apprenticeship job offers",
  },
  headline: {
    en: "Maximize the visibility of your apprenticeship job offers by posting them on the La bonne alternance platform and its partner sites",
    fr: "Maximiser la visibilité de vos offres d’emploi en alternance en les diffusant sur la plateforme La bonne alternance ainsi que ses sites partenaires",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const depotOffrePageDoc = {
  tag: "job",
  operationIds: ["jobOfferCreate", "jobOfferUpdate"],
  habilitation: "jobs:write",
  description: [
    {
      fr: "**Déposez, modifiez ou supprimez vos offres d’emploi en alternance** pour maximiser leur visibilité en les diffusant sur la plateforme [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) ainsi que [ses sites partenaires](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1).",
      en: "**Post, modify, or delete your apprenticeship job offers** to maximize their visibility by posting them on the [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) platform and [its partner sites](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1).",
    },
    {
      en: "**💡 This API allows you to share your apprenticeship job offers for free in a secure and automated way.** If you prefer to post your offers via an interface, you can use [the manual offer posting form offered by La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/espace-pro/creation/entreprise).",
      fr: "**💡 Cette API vous permet de partager gratuitement vos offres en alternance de manière sécurisée et automatisée.** Si vous préférez déposer vos offres via une interface, vous pouvez utiliser [le formulaire de dépôt d’offre manuel proposé par La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/espace-pro/creation/entreprise).",
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
      name: { fr: "Offre d'emploi", en: "Job offer" },
      sections: {
        contract: rechercheOffrePageDoc.data[0].sections.contract,
        offer: {
          name: rechercheOffrePageDoc.data[0].sections.offer.name,
          rows: {
            ...rechercheOffrePageDoc.data[0].sections.offer.rows,
            multicast: {
              description: {
                en: "By default, the offers posted are available on La bonne alternance and redistributed to its [partner sites](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1). You can choose to exclude the redistribution to partner sites by specifying `multicast: false`.",
                fr: "Par défaut les offres déposées sont disponibles sur La bonne alternance, et rediffusées auprès de ses [sites partenaires](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1). Vous pouvez choisir d'exclure la diffusion sur les sites partenaires en spécifiant `multicast: false`.",
              },
              tags: [],
              information: {
                fr: "Lorsque l'option `multicast` est activée, l'adresse email de contact de l'entreprise n'est pas partagée avec les sites partenaires. La liste des données partagées est disponible sur la page [recherche d’opportunités d’emploi en alternance](./recherche-offre).",
                en: "When the `multicast` option is activated, the company's contact email address is not shared with partner sites. The list of shared data is available on the [alternance job opportunities search page](./recherche-offre).",
              },
            },
          },
        },
        workplace: {
          name: rechercheOffrePageDoc.data[0].sections.workplace.name,
          rows: {
            workplace: rechercheOffrePageDoc.data[0].sections.workplace.rows.workplace,
            location: rechercheOffrePageDoc.data[0].sections.workplace.rows.location,
          },
        },
        apply: {
          name: { en: "Apply", fr: null },
          rows: {
            apply: {
              description: { en: applyDescEn, fr: applyDescFr },
              tags: [],
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
