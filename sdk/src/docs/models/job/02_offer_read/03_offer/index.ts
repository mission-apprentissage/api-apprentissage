import type { DocBusinessSection } from "../../../../types.js";
import offerPublication from "./offer.publication/index.js";
import offer from "./offer/index.js";

export default {
  name: "Offer",
  fields: {
    offer,
    ["offer.access_conditions"]: {
      description: "The conditions for entering the profession",
    },
    ["offer.access_conditions[]"]: {
      description: "The conditions for entering the profession",
      examples: [
        "Ce métier est accessible avec un diplôme de niveau Bac+2 (BTS, DUT) à Master (MIAGE, diplôme d'ingénieur, Master professionnel, ...) en informatique.",
        "Il est également accessible avec une expérience professionnelle en informatique, système d'exploitation ou dans un domaine applicatif.",
        "La pratique de l'anglais (vocabulaire technique) est requise.",
      ],
    },
    ["offer.description"]: {
      description: "Job offer description.",
      examples: [
        "Conçoit, développe et met au point un projet d'application informatique, de la phase d'étude à son intégration, pour un client ou une entreprise selon des besoins fonctionnels et un cahier des charges. Peut conduire des projets de développement. Peut coordonner une équipe.",
      ],
    },
    ["offer.desired_skills"]: {
      description: "The skills or qualities expected for the position.",
    },
    ["offer.desired_skills[]"]: {
      description: "The skills or qualities expected for the position.",
      examples: [
        "Faire preuve d'autonomie",
        "Faire preuve de créativité, d'inventivité",
        "Faire preuve de rigueur et de précision",
        "Travailler en équipe",
      ],
    },
    ["offer.opening_count"]: {
      description: "Number of positions available for this job offer",
      examples: [1, 3],
    },
    ["offer.publication"]: offerPublication,
    ["offer.publication.creation"]: {
      description: "Creation date of the job opportunity.",
      examples: ["2024-07-23T13:23:01.000Z"],
    },
    ["offer.publication.expiration"]: {
      description: "Expiration date of the job opportunity.",
      examples: ["2027-05-14T00:00:00Z"],
    },
    ["offer.rome_codes"]: {
      description: "ROME code(s) of the offer",
    },
    ["offer.rome_codes[]"]: {
      description: "ROME code",
      examples: ["A1401"],
    },
    ["offer.status"]: {
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
    ["offer.target_diploma"]: {
      description: "Targeted diploma level at the end of studies.",
    },
    ["offer.target_diploma.european"]: {
      description: "Targeted diploma level at the end of studies.",
      examples: [3],
    },
    ["offer.target_diploma.label"]: {
      description: "The title of the targeted diploma level at the end of studies.",
      examples: ["BP, Bac, autres formations niveau (Bac)"],
    },
    ["offer.title"]: {
      description: "Job offer title.",
      examples: ["Développeur / Développeuse web"],
    },
    ["offer.to_be_acquired_skills"]: {
      description: "The skills or qualities to be acquired during the apprenticeship.",
    },
    ["offer.to_be_acquired_skills[]"]: {
      description: "The skills or qualities to be acquired during the apprenticeship.",
      examples: [
        "Recherche, Innovation : Analyser les indicateurs pertinents sur les tendances et les usages des clients",
        "Recherche, Innovation : Concevoir et développer une solution digitale",
        "Nouvelles technologies : Assembler des composants logiciels",
      ],
    },
  },
} as const satisfies DocBusinessSection;
