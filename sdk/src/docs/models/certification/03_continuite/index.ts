import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import continuite from "./continuite/index.js";

export default {
  name: "Continuité",
  fields: {
    continuite,
    "continuite.cfd": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.cfd[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.cfd[].ouverture": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.cfd[].fermeture": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.cfd[].code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.cfd[].courant": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp[].activation": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp[].fin_enregistrement": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp[].code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp[].courant": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "continuite.rncp[].actif": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
