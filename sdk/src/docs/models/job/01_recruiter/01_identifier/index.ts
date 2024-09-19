import type { DocBusinessSection } from "../../../../types.js";
import identifier from "./identifier/index.js";

export default {
  name: "Identifier",
  fields: {
    identifier,
    ["identifier.id"]: {
      description: "Partner responsible for the job offer.",
      examples: ["6687165396d52b5e01b409545"],
    },
  },
} as const satisfies DocBusinessSection;
