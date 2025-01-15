import type { DocPage, OpenApiText } from "../../types.js";
import applyDescEn from "./en/apply.description.md.js";
import contractDescEn from "./en/contract.description.md.js";
import descriptionEn from "./en/description.md.js";
import identifierDescEn from "./en/identifier.description.md.js";
import offerDescEn from "./en/offer.description.md.js";
import offerPublicationDescEn from "./en/offer.publication.description.md.js";
import workplaceDescEn from "./en/workplace.description.md.js";
import workplaceDomainDescEn from "./en/workplace.domain.description.md.js";
import workplaceLocationDescEn from "./en/workplace.location.description.md.js";
import applyDescFr from "./fr/apply.description.md.js";
import contractDescFr from "./fr/contract.description.md.js";
import descriptionFr from "./fr/description.md.js";
import identifierDescFr from "./fr/identifier.description.md.js";
import offerDescFr from "./fr/offer.description.md.js";
import offerPublicationDescFr from "./fr/offer.publication.description.md.js";
import workplaceDescFr from "./fr/workplace.description.md.js";
import workplaceDomainDescFr from "./fr/workplace.domain.description.md.js";
import workplaceLocationDescFr from "./fr/workplace.location.description.md.js";

const recruiterSections = {
  identifier: {
    name: { en: "Identifier", fr: null },
    rows: {
      identifier: {
        metier: true,
        description: { en: identifierDescEn, fr: identifierDescFr },
        tags: [],
      },
    },
  },
  workplace: {
    name: { en: "Workplace", fr: null },
    rows: {
      workplace: {
        metier: true,
        description: { en: workplaceDescEn, fr: workplaceDescFr },
        tags: [],
      },
      location: {
        metier: true,
        description: { en: workplaceLocationDescEn, fr: workplaceLocationDescFr },
        tags: [],
      },
      domain: {
        metier: true,
        description: { en: workplaceDomainDescEn, fr: workplaceDomainDescFr },
        tags: [],
      },
    },
  },
  apply: {
    name: { en: "Apply", fr: null },
    rows: {
      apply: {
        metier: true,
        description: { en: applyDescEn, fr: applyDescFr },
        tags: [],
      },
    },
  },
};

export const rechercheOffrePageSummaryDoc = {
  en: "Access all apprenticeship job opportunities for free and in real-time",
  fr: "Accéder gratuitement et en temps réel à l'ensemble des opportunités d'emploi en alternance",
} as OpenApiText;

export const rechercheOffrePageDoc = {
  description: [
    {
      en: "**Access all apprenticeship job opportunities available in France for free and in real-time.** The returned job opportunities are those collected by [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) and [its partner sites](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1?pvs=74).",
      fr: "**Accédez gratuitement et en temps réel à l'ensemble des opportunités d'emploi en alternance disponibles sur le territoire français.** Les opportunités d’emploi retournées sont celles collectées par [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) ainsi que [ses sites partenaires](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1?pvs=74).",
    },
    {
      fr: "Deux types d’opportunités d’emploi sont disponibles :",
      en: "Two types of job opportunities are available :",
    },
    {
      fr: "1. Des offres d’emploi en alternance\n2. Des entreprises n'ayant pas diffusé d'offres, mais ayant été identifiées comme \"à fort potentiel d'embauche en alternance\" grâce à l'analyse de diverses données publiques (données de recrutement, données financières, etc.). Cette liste restreinte d'entreprises a vocation à rendre plus visible le marché caché de l’emploi et ainsi faciliter les démarches de candidatures spontanées des candidats à l’alternance.",
      en: '1. Apprenticeship job offers\n2. Companies that have not posted offers but have been identified as "having a high potential for hiring apprentices" through the analysis of various public data (recruitment data, financial data, etc.). This shortlist of companies aims to make the hidden job market more visible and thus facilitate the spontaneous application process for apprenticeship candidates.',
    },
    {
      fr: "**💡 Vous pouvez rechercher dans l’ensemble opportunités d’emploi selon les critères suivants : Code(s) ROME, RNCP, géolocalisation, niveau de diplôme et rayon de recherche.**",
      en: "**💡 You can search for all job opportunities according to the following criteria: ROME code(s), RNCP, geolocation, diploma level, and search radius.**",
    },
    {
      fr: "Les résultats sont retournés par priorité de source (La bonne alternance puis ses partenaires),  par distance croissante au lieu de recherche si ce dernier a été fourni en paramètre et par date de création décroissante.",
      en: "The results are returned by source priority (La bonne alternance then its partners), by increasing distance to the search location if it has been provided as a parameter, and by decreasing creation date.",
    },
    {
      fr: "Les résultats sont limités à 150 par source.",
      en: "The results are limited to 150 per source.",
    },
    {
      fr: "L'utilisation de cette API est gratuite et réservée à des usages non lucratifs. Notez que toute utilisation de ces données à des fins commerciales, telles que la revente ou la facturation de l'accès pour des tiers comme des candidats, entreprises ou écoles, est interdite.",
      en: "The use of this API is free and reserved for non-profit uses. Note that any use of this data for commercial purposes, such as reselling or billing access to third parties such as candidates, companies, or schools, is prohibited.",
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
      name: { en: "Job Offer", fr: "Offre d'emploi" },
      sections: {
        identifier: recruiterSections.identifier,
        contract: {
          name: { en: "Contract", fr: null },
          rows: {
            contract: {
              description: { en: contractDescEn, fr: contractDescFr },
              tags: [],
            },
          },
        },
        offer: {
          name: { en: "Offer", fr: null },
          rows: {
            offer: {
              description: { en: offerDescEn, fr: offerDescFr },
              information: {
                en: "The ROME corresponds to the Operational Reference for Jobs and Occupations. Designed by France Travail (formerly Pôle Emploi), this reference system presents all professions grouped into profiles, organized by professional fields.",
                fr: "Le ROME correspond au Référentiel Opérationnel des Métiers et des Emplois. Conçu par France Travail (anciennement Pôle Emploi), ce référentiel présente l'ensemble des métiers regroupés par fiches, organisées par domaines professionnels.",
              },
              tags: [],
            },
            publication: {
              description: { en: offerPublicationDescEn, fr: offerPublicationDescFr },
              tags: [],
            },
          },
        },
        workplace: recruiterSections.workplace,
        apply: recruiterSections.apply,
      },
    },
    {
      name: { en: "Recruiter", fr: "Recruteur" },
      sections: recruiterSections,
    },
  ],
} as const satisfies DocPage;
