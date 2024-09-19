import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import blocs_competences from "./blocs_competences/index.js";

export default {
  name: "Blocs de compétences",
  fields: {
    blocs_competences,
    "blocs_competences.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "blocs_competences.rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "blocs_competences.rncp[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "blocs_competences.rncp[].intitule": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
