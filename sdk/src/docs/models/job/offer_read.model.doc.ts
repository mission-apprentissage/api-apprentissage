import type { DataSource, DocModel } from "../../types.js";
import contractDescEn from "./offer_read_docs/en/contract.description.md.js";
import offerDescEn from "./offer_read_docs/en/offer.description.md.js";
import offerPublicationDescEn from "./offer_read_docs/en/offer.publication.description.md.js";
import offerStatusDescEn from "./offer_read_docs/en/offer.status.description.md.js";
import contractDescFr from "./offer_read_docs/fr/contract.description.md.js";
import offerDescFr from "./offer_read_docs/fr/offer.description.md.js";
import offerPublicationDescFr from "./offer_read_docs/fr/offer.publication.description.md.js";
import offerStatusDescFr from "./offer_read_docs/fr/offer.status.description.md.js";
import { recruiterModelDoc } from "./recruiter.model.doc.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png" },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const offerReadModelDoc = {
  name: "Offre d'emploi",
  description: null,
  sources,
  _: {
    identifier: {
      ...recruiterModelDoc._.identifier,
      _: {
        id: {
          description: { en: "Identifier of the job offer in the La bonne alternance database.", fr: null },
          examples: ["6687165396d52b5e01b409545"],
          notes: {
            en: "France Travail offers are not stored in the La bonne alternance database but are retrieved on the fly. They do not have an identifier in the database.",
            fr: null,
          },
        },
        partner_job_id: {
          description: { en: "Offer identifier within the partner's information system.", fr: null },
          examples: ["b16a546a-e61f-4028-b5a3-1a7bbfaa4e3d"],
        },
        partner_label: {
          description: { en: "Partner originating the job offer.", fr: null },
          notes: { en: 'In the case of La Bonne Alternance, the partner_label is: "La bonne alternance".', fr: null },
          examples: ["France Travail", "La bonne alternance"],
        },
      },
    },
    contract: {
      section: { en: "Contract", fr: null },
      metier: true,
      description: { en: contractDescEn, fr: contractDescFr },
      tags: [],
      _: {
        duration: {
          description: { en: "Contract duration in months.", fr: null },
          examples: [12],
        },
        start: {
          description: { en: "Date de début du contrat.", fr: null },
          examples: ["2024-09-23T10:00:00.000Z"],
        },
        type: {
          description: { en: "Contract type (apprenticeship and/or professionalization)", fr: null },
          _: {
            "[]": {
              description: { en: "Contract type (apprenticeship and/or professionalization)", fr: null },
              examples: ["Apprentissage", "Professionnalisation"],
            },
          },
        },
        remote: {
          description: { en: "Work mode (on-site, remote, or hybrid)", fr: null },
          examples: ["onsite", "remote", "hybrid"],
        },
      },
    },
    offer: {
      section: { en: "Offer", fr: null },
      metier: true,
      description: { en: offerDescEn, fr: offerDescFr },
      information: {
        en: "The ROME corresponds to the Operational Reference for Jobs and Occupations. Designed by France Travail (formerly Pôle Emploi), this reference system presents all professions grouped into profiles, organized by professional fields.",
        fr: "Le ROME correspond au Référentiel Opérationnel des Métiers et des Emplois. Conçu par France Travail (anciennement Pôle Emploi), ce référentiel présente l'ensemble des métiers regroupés par fiches, organisées par domaines professionnels.",
      },
      tags: [],
      _: {
        access_conditions: {
          description: { en: "The conditions for entering the profession", fr: null },
          _: {
            "[]": {
              description: { en: "The conditions for entering the profession", fr: null },
              examples: [
                "Ce métier est accessible avec un diplôme de niveau Bac+2 (BTS, DUT) à Master (MIAGE, diplôme d'ingénieur, Master professionnel, ...) en informatique.",
                "Il est également accessible avec une expérience professionnelle en informatique, système d'exploitation ou dans un domaine applicatif.",
                "La pratique de l'anglais (vocabulaire technique) est requise.",
              ],
            },
          },
        },
        description: {
          description: { en: "Job offer description.", fr: null },
          examples: [
            "Conçoit, développe et met au point un projet d'application informatique, de la phase d'étude à son intégration, pour un client ou une entreprise selon des besoins fonctionnels et un cahier des charges. Peut conduire des projets de développement. Peut coordonner une équipe.",
          ],
        },
        desired_skills: {
          description: { en: "The skills or qualities expected for the position.", fr: null },
          _: {
            "[]": {
              description: { en: "The skills or qualities expected for the position.", fr: null },
              examples: [
                "Faire preuve d'autonomie",
                "Faire preuve de créativité, d'inventivité",
                "Faire preuve de rigueur et de précision",
                "Travailler en équipe",
              ],
            },
          },
        },
        opening_count: {
          description: { en: "Number of positions available for this job offer", fr: null },
          examples: [1, 3],
        },
        rome_codes: {
          description: { en: "ROME code(s) of the offer", fr: null },
          _: {
            "[]": {
              description: { en: "ROME code", fr: null },
              examples: ["A1401"],
            },
          },
        },
        status: {
          description: { en: offerStatusDescEn, fr: offerStatusDescFr },
          notes: { en: "Only active offers are returned by the search.", fr: null },
          examples: ["Active"],
        },
        target_diploma: {
          description: { en: "Targeted diploma level at the end of studies.", fr: null },
          _: {
            european: {
              description: { en: "Targeted diploma level at the end of studies.", fr: null },
              examples: [3],
            },
            label: {
              description: { en: "The title of the targeted diploma level at the end of studies.", fr: null },
              examples: ["BP, Bac, autres formations niveau (Bac)"],
            },
          },
        },
        title: {
          description: { en: "Job offer title.", fr: null },
          examples: ["Développeur / Développeuse web"],
        },
        to_be_acquired_skills: {
          description: { en: "The skills or qualities to be acquired during the apprenticeship.", fr: null },
          _: {
            "[]": {
              description: { en: "The skills or qualities to be acquired during the apprenticeship.", fr: null },
              examples: [
                "Recherche, Innovation : Analyser les indicateurs pertinents sur les tendances et les usages des clients",
                "Recherche, Innovation : Concevoir et développer une solution digitale",
                "Nouvelles technologies : Assembler des composants logiciels",
              ],
            },
          },
        },
        publication: {
          section: { en: "Offer", fr: null },
          metier: true,
          description: { en: offerPublicationDescEn, fr: offerPublicationDescFr },
          tags: [],
          _: {
            creation: {
              description: { en: "Creation date of the job opportunity.", fr: null },
              examples: ["2024-07-23T13:23:01.000Z"],
            },
            expiration: {
              description: { en: "Expiration date of the job opportunity.", fr: null },
              examples: ["2027-05-14T00:00:00Z"],
            },
          },
        },
      },
    },
    workplace: recruiterModelDoc._.workplace,
    apply: recruiterModelDoc._.apply,
  },
} as const satisfies DocModel;
