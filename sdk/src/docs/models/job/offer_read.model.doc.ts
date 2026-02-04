import contractDescEn from "../../metier/recherche-offre/en/contract.description.md.js";
import offerDescEn from "../../metier/recherche-offre/en/offer.description.md.js";
import offerPublicationDescEn from "../../metier/recherche-offre/en/offer.publication.description.md.js";
import offerStatusDescEn from "../../metier/recherche-offre/en/offer.status.description.md.js";
import contractDescFr from "../../metier/recherche-offre/fr/contract.description.md.js";
import offerDescFr from "../../metier/recherche-offre/fr/offer.description.md.js";
import offerPublicationDescFr from "../../metier/recherche-offre/fr/offer.publication.description.md.js";
import offerStatusDescFr from "../../metier/recherche-offre/fr/offer.status.description.md.js";
import type { DocTechnicalField } from "../../types.js";
import { recruiterModelDoc } from "./recruiter.model.doc.js";

export const offerReadModelDoc = {
  descriptions: [{ fr: "Offre d'emploi", en: "Job offer" }],
  properties: {
    identifier: {
      ...recruiterModelDoc.properties.identifier,
      properties: {
        id: {
          descriptions: [
            {
              en: "Identifier of the job offer in the La bonne alternance database.",
              fr: "Identifiant de l'offre d'emploi dans la base de données La bonne alternance.",
            },
            {
              en: "France Travail offers are not stored in the La bonne alternance database but are retrieved on the fly. They do not have an identifier in the database.",
              fr: "Les offres France Travail ne sont pas stockées dans la base de données La bonne alternance mais sont récupérées à la volée. Elles n'ont pas d'identifiant dans la base de données.",
            },
          ],
          examples: ["6687165396d52b5e01b409545"],
        },
        partner_job_id: {
          descriptions: [
            {
              en: "Offer identifier within the partner's information system.",
              fr: "Identifiant de l'offre dans le système d'information du partenaire.",
            },
          ],
          examples: ["b16a546a-e61f-4028-b5a3-1a7bbfaa4e3d"],
        },
        partner_label: {
          descriptions: [
            { en: "Partner originating the job offer.", fr: "Partenaire à l'origine de l'offre d'emploi." },
            {
              en: 'In the case of offers collected by La Bonne Alternance, the partner_label is: "offres_emploi_lba".<br />In the case of companies identified with a high potential to recruit, the partner_label is: "recruteurs_lba".',
              fr: 'Dans le cas des offres collectées par La Bonne Alternance, le partner_label est : "offres_emploi_lba".<br />Dans le cas des entreprises identifiées comme ayant un fort potentiel d’embauche, le partner_label est : "recruteurs_lba".',
            },
          ],
          examples: ["France Travail", "offres_emploi_lba"],
        },
      },
    },
    contract: {
      descriptions: [{ en: contractDescEn, fr: contractDescFr }],
      properties: {
        duration: {
          descriptions: [{ en: "Contract duration in months.", fr: "Durée du contrat en mois." }],
          examples: [12],
        },
        start: {
          descriptions: [{ fr: "Date de début du contrat.", en: "Start date of the contract." }],
          examples: ["2024-09-23T10:00:00.000Z"],
        },
        type: {
          descriptions: [
            {
              en: "Contract type (apprenticeship and/or professionalization)",
              fr: "Type de contrat (apprentissage et/ou professionnalisation)",
            },
          ],
          items: {
            descriptions: [
              {
                en: "Contract type (apprenticeship and/or professionalization)",
                fr: "Type de contrat (apprentissage et/ou professionnalisation)",
              },
            ],
            examples: ["Apprentissage", "Professionnalisation"],
          },
        },
        remote: {
          descriptions: [
            { en: "Work mode (on-site, remote, or hybrid)", fr: "Mode de travail (sur site, à distance ou hybride)" },
          ],
          examples: ["onsite", "remote", "hybrid"],
        },
      },
    },
    offer: {
      descriptions: [{ en: offerDescEn, fr: offerDescFr }],
      properties: {
        access_conditions: {
          descriptions: [{ en: "The conditions for entering the profession", fr: "Les conditions d'accès au métier" }],
          items: {
            descriptions: [
              { en: "The conditions for entering the profession", fr: "Les conditions d'accès au métier" },
            ],
            examples: [
              "Ce métier est accessible avec un diplôme de niveau Bac+2 (BTS, DUT) à Master (MIAGE, diplôme d'ingénieur, Master professionnel, ...) en informatique.",
              "Il est également accessible avec une expérience professionnelle en informatique, système d'exploitation ou dans un domaine applicatif.",
              "La pratique de l'anglais (vocabulaire technique) est requise.",
            ],
          },
        },
        description: {
          descriptions: [{ en: "Job offer description.", fr: "Description de l'offre d'emploi." }],
          examples: [
            "Conçoit, développe et met au point un projet d'application informatique, de la phase d'étude à son intégration, pour un client ou une entreprise selon des besoins fonctionnels et un cahier des charges. Peut conduire des projets de développement. Peut coordonner une équipe.",
          ],
        },
        desired_skills: {
          descriptions: [
            {
              en: "The skills or qualities expected for the position.",
              fr: "Les compétences ou qualités attendues pour le poste.",
            },
          ],
          items: {
            descriptions: [
              {
                en: "The skills or qualities expected for the position.",
                fr: "Les compétences ou qualités attendues pour le poste.",
              },
            ],
            examples: [
              "Faire preuve d'autonomie",
              "Faire preuve de créativité, d'inventivité",
              "Faire preuve de rigueur et de précision",
              "Travailler en équipe",
            ],
          },
        },
        opening_count: {
          descriptions: [
            {
              en: "Number of positions available for this job offer",
              fr: "Nombre de postes disponibles pour cette offre d'emploi",
            },
          ],
          examples: [1, 3],
        },
        rome_codes: {
          descriptions: [{ en: "ROME code(s) of the offer", fr: "Code(s) ROME de l'offre" }],
          items: {
            descriptions: [{ en: "ROME code", fr: "Code ROME" }],
            examples: ["A1401"],
          },
        },
        status: {
          descriptions: [
            { en: offerStatusDescEn, fr: offerStatusDescFr },
            {
              en: "Only active offers are returned by the search.",
              fr: "Seules les offres actives sont retournées par la recherche.",
            },
          ],
          examples: ["Active"],
        },
        target_diploma: {
          descriptions: [
            { en: "Targeted diploma level at the end of studies.", fr: "Diplôme visé à l'issue des études." },
          ],
          properties: {
            european: {
              descriptions: [
                { en: "Targeted diploma level at the end of studies.", fr: "Diplôme visé à l'issue des études." },
              ],
              examples: ["3"],
            },
            label: {
              descriptions: [
                {
                  en: "The title of the targeted diploma level at the end of studies.",
                  fr: "Le nom du diplôme visé à l'issue des études.",
                },
              ],
              examples: ["BP, Bac, autres formations niveau (Bac)"],
            },
          },
        },
        title: {
          descriptions: [{ en: "Job offer title.", fr: "Intitulé de l'offre d'emploi." }],
          examples: ["Développeur / Développeuse web"],
        },
        to_be_acquired_skills: {
          descriptions: [
            {
              en: "The skills or qualities to be acquired during the apprenticeship.",
              fr: "Les compétences ou qualités à acquérir durant l'apprentissage.",
            },
          ],
          items: {
            descriptions: [
              {
                en: "The skills or qualities to be acquired during the apprenticeship.",
                fr: "Les compétences ou qualités à acquérir durant l'apprentissage.",
              },
            ],
            examples: [
              "Recherche, Innovation : Analyser les indicateurs pertinents sur les tendances et les usages des clients",
              "Recherche, Innovation : Concevoir et développer une solution digitale",
              "Nouvelles technologies : Assembler des composants logiciels",
            ],
          },
        },
        publication: {
          descriptions: [{ en: offerPublicationDescEn, fr: offerPublicationDescFr }],
          properties: {
            creation: {
              descriptions: [
                { en: "Creation date of the job opportunity.", fr: "Date de création de l'opportunité d'emploi." },
              ],
              examples: ["2024-07-23T13:23:01.000Z"],
            },
            expiration: {
              descriptions: [
                { en: "Expiration date of the job opportunity.", fr: "Date d'expiration de l'opportunité d'emploi." },
              ],
              examples: ["2027-05-14T00:00:00Z"],
            },
          },
        },
      },
    },
    workplace: recruiterModelDoc.properties.workplace,
    apply: recruiterModelDoc.properties.apply,
    is_delegated: {
      descriptions: [
        {
          en: "true if offer management is delegated to a partner school. false otherwise",
          fr: "Indique si la gestion de l'offre est déléguée à un CFA partenaire. valeurs true | false",
        },
      ],
      examples: [true],
    },
  },
} as const satisfies DocTechnicalField;
