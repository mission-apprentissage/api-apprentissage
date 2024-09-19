import type { DocBusinessSection } from "../../../../types.js";
import contract from "./contract/index.js";

export default {
  name: "Contract",
  fields: {
    contract,
    ["contract.duration"]: {
      type: "technical",
      description: "Contract duration in months.",
      examples: [12],
    },
    ["contract.start"]: {
      type: "technical",
      description: "Date de début du contrat.",
    },
    ["contract.type"]: {
      type: "technical",
      description: "Contract type (apprenticeship and/or professionalization)",
    },
    ["contract.type[]"]: {
      type: "technical",
      description: "Contract type (apprenticeship and/or professionalization)",
      examples: ["Apprentissage", "Professionnalisation"],
    },
    ["contract.remote"]: {
      type: "technical",
      description: "Work mode (on-site, remote, or hybrid)",
      examples: ["onsite", "remote", "hybrid"],
    },
  },
} as const satisfies DocBusinessSection;
