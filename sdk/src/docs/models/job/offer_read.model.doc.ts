import type { DataSource, DocModel } from "../../types.js";
import contractDesc from "./offer_read_docs/contract.description.md.js";
import offerDesc from "./offer_read_docs/offer.description.md.js";
import offerPublicationDesc from "./offer_read_docs/offer.publication.description.md.js";
import { recruiterModelDoc } from "./recruiter.model.doc.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png", width: 171, height: 48 },
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
          description: "Identifier of the job offer in the La bonne alternance database.",
          examples: ["6687165396d52b5e01b409545 "],
          notes:
            "France Travail offers are not stored in the La bonne alternance database but are retrieved on the fly. They do not have an identifier in the database.",
        },
        partner_job_id: {
          description: "Offer identifier within the partner's information system.",
          examples: ["b16a546a-e61f-4028-b5a3-1a7bbfaa4e3d"],
        },
        partner_label: {
          description: "Partner originating the job offer.",
          notes: 'In the case of La Bonne Alternance, the partner_label is: "La bonne alternance".',
          examples: ["France Travail", "La bonne alternance"],
        },
      },
    },
    contract: {
      section: "Contract",
      metier: true,
      description: contractDesc,
      tags: [],
      _: {
        duration: {
          description: "Contract duration in months.",
          examples: [12],
        },
        start: {
          description: "Date de début du contrat.",
        },
        type: {
          description: "Contract type (apprenticeship and/or professionalization)",
          _: {
            "[]": {
              description: "Contract type (apprenticeship and/or professionalization)",
              examples: ["Apprentissage", "Professionnalisation"],
            },
          },
        },
        remote: {
          description: "Work mode (on-site, remote, or hybrid)",
          examples: ["onsite", "remote", "hybrid"],
        },
      },
    },
    offer: {
      section: "Offer",
      metier: true,
      description: offerDesc,
      information:
        "The ROME corresponds to the Operational Reference for Jobs and Occupations. Designed by France Travail (formerly Pôle Emploi), this reference system presents all professions grouped into profiles, organized by professional fields.",
      tags: [],
      _: {
        access_conditions: {
          description: "The conditions for entering the profession",
          _: {
            "[]": {
              description: "The conditions for entering the profession",
              examples: [
                "Ce métier est accessible avec un diplôme de niveau Bac+2 (BTS, DUT) à Master (MIAGE, diplôme d'ingénieur, Master professionnel, ...) en informatique.",
                "Il est également accessible avec une expérience professionnelle en informatique, système d'exploitation ou dans un domaine applicatif.",
                "La pratique de l'anglais (vocabulaire technique) est requise.",
              ],
            },
          },
        },
        description: {
          description: "Job offer description.",
          examples: [
            "Conçoit, développe et met au point un projet d'application informatique, de la phase d'étude à son intégration, pour un client ou une entreprise selon des besoins fonctionnels et un cahier des charges. Peut conduire des projets de développement. Peut coordonner une équipe.",
          ],
        },
        desired_skills: {
          description: "The skills or qualities expected for the position.",
          _: {
            "[]": {
              description: "The skills or qualities expected for the position.",
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
          description: "Number of positions available for this job offer",
          examples: [1, 3],
        },
        rome_codes: {
          description: "ROME code(s) of the offer",
          _: {
            "[]": {
              description: "ROME code",
              examples: ["A1401"],
            },
          },
        },
        status: {
          description: [
            "The status of the offer (life cycle):",
            "- Active: The offer is available on the platform, and applications are open.",
            "- Filled: The offer has been filled and is no longer available.",
            "- Cancelled: The offer has been canceled and is no longer available.",
            "- Pending: The offer is awaiting validation by ? and is not available.",
          ].join("\n\n"),
          notes: "Only active offers are returned by the search.",
          examples: ["Active"],
        },
        target_diploma: {
          description: "Targeted diploma level at the end of studies.",
          _: {
            european: {
              description: "Targeted diploma level at the end of studies.",
              examples: [3],
            },
            label: {
              description: "The title of the targeted diploma level at the end of studies.",
              examples: ["BP, Bac, autres formations niveau (Bac)"],
            },
          },
        },
        title: {
          description: "Job offer title.",
          examples: ["Développeur / Développeuse web"],
        },
        to_be_acquired_skills: {
          description: "The skills or qualities to be acquired during the apprenticeship.",
          _: {
            "[]": {
              description: "The skills or qualities to be acquired during the apprenticeship.",
              examples: [
                "Recherche, Innovation : Analyser les indicateurs pertinents sur les tendances et les usages des clients",
                "Recherche, Innovation : Concevoir et développer une solution digitale",
                "Nouvelles technologies : Assembler des composants logiciels",
              ],
            },
          },
        },
        publication: {
          section: "Offer",
          metier: true,
          description: offerPublicationDesc,
          tags: [],
          _: {
            creation: {
              description: "Creation date of the job opportunity.",
              examples: ["2024-07-23T13:23:01.000Z"],
            },
            expiration: {
              description: "Expiration date of the job opportunity.",
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
