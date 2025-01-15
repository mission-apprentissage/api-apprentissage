import type { DocPage, OpenApiText } from "../../types.js";
import applyDescEn from "./en/apply.description.md.js";
import contractDescEn from "./en/contract.description.md.js";
import identifierDescEn from "./en/identifier.description.md.js";
import offerDescEn from "./en/offer.description.md.js";
import offerPublicationDescEn from "./en/offer.publication.description.md.js";
import workplaceDescEn from "./en/workplace.description.md.js";
import workplaceDomainDescEn from "./en/workplace.domain.description.md.js";
import workplaceLocationDescEn from "./en/workplace.location.description.md.js";
import applyDescFr from "./fr/apply.description.md.js";
import contractDescFr from "./fr/contract.description.md.js";
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
      en: "**Access all apprenticeship job opportunities in France for free and in real-time.** The job opportunities returned are those collected on {{- lienLba }}, retrieved by France Travail, and shared by our partners.",
      fr: "**Accédez gratuitement en temps réel à l'ensemble des opportunités d'emploi en alternance sur le territoire français.** Les opportunités d’emploi retournées sont celles collectées sur {{- lienLba }}, récupérées par France Travail et partagées par nos partenaires.",
    },
    {
      en: "**💡 You can search all job opportunities based on the following criteria:** ROME code(s), RNCP, geolocation, diploma level, and search radius.",
      fr: "**💡 Vous pouvez rechercher dans l’ensemble opportunités d’emploi selon les critères suivants :** Code(s) ROME, RNCP, géolocalisation, niveau de diplôme et rayon de recherche.",
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
      name: { en: null, fr: "Offre d'emploi" },
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
