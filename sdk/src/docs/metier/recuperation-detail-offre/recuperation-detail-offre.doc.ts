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
  workplace: {
    name: { en: "Workplace", fr: null },
    rows: {
      workplace: {
        description: { en: workplaceDescEn, fr: workplaceDescFr },
        tags: [".siret", ".name", ".description", ".brand", ".legal_name", ".size", ".website"],
      },
      location: {
        description: { en: workplaceLocationDescEn, fr: workplaceLocationDescFr },
        tags: [".address", ".geopoint"],
      },
      domain: {
        description: { en: workplaceDomainDescEn, fr: workplaceDomainDescFr },
        tags: [".idcc", ".naf", ".opco"],
      },
    },
  },
  apply: {
    name: { en: "Apply", fr: null },
    rows: {
      apply: {
        description: { en: applyDescEn, fr: applyDescFr },
        tags: [".recipient_id", ".phone", ".url"],
      },
    },
  },
};

export const recuperationDetailOffrePageSummaryDoc = {
  title: {
    en: "Retrieval of the details of an apprenticeship job offer",
    fr: "Récupération du détail d'une opportunité d'emploi en alternance",
  },
  headline: {
    en: "Access the details of a work-study job offer",
    fr: "Accéder au détail d'une opportunité d'emploi en alternance",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const recuperationDetailOffrePageDoc = {
  tag: "job",
  operationIds: ["jobSearch"],
  habilitation: null,
  description: [
    {
      en: descriptionEn,
      fr: descriptionFr,
    },
  ],
  frequenceMiseAJour: "daily",
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
      name: { en: "Job Offer", fr: "Offre d'emploi" },
      sections: {
        identifier: {
          name: { en: "Identifier", fr: null },
          rows: {
            identifier: {
              description: { en: identifierDescEn, fr: identifierDescFr },
              tags: [".id", ".partner_job_id", ".partner_label"],
            },
          },
        },
        contract: {
          name: { en: "Contract", fr: null },
          rows: {
            contract: {
              description: { en: contractDescEn, fr: contractDescFr },
              tags: [".duration", ".start", ".type", ".remote"],
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
              tags: [
                ".access_conditions",
                ".description",
                ".desired_skills",
                ".opening_count",
                ".rome_codes",
                ".status",
                ".target_diploma",
                ".title",
                ".to_be_acquired_skills",
              ],
            },
            publication: {
              description: { en: offerPublicationDescEn, fr: offerPublicationDescFr },
              tags: [".creation", ".expiration"],
            },
          },
        },
        workplace: recruiterSections.workplace,
        apply: recruiterSections.apply,
      },
    },
  ],
} as const satisfies DocPage;
