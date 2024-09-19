import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import conventions_collectives from "./conventions_collectives/index.js";

export default {
  name: "Blocs de compétences",
  fields: {
    conventions_collectives,
    "convention_collectives.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "convention_collectives.rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "convention_collectives.rncp[].numero": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "convention_collectives.rncp[].intitule": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
