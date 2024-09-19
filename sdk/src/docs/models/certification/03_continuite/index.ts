import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import continuite from "./continuite/index.js";

export default {
  name: "Continuité",
  fields: {
    continuite,
    "continuite.cfd": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.cfd[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.cfd[].ouverture": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.cfd[].fermeture": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.cfd[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.cfd[].courant": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp[].activation": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp[].fin_enregistrement": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp[].courant": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "continuite.rncp[].actif": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
