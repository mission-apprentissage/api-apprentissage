import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import base_legale from "./base_legale/index.js";

export default {
  name: "Base légale",
  fields: {
    base_legale,
    "base_legale.cfd": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "base_legale.cfd.creation": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "base_legale.cfd.abrogation": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
