import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import domaines from "./domaines/index.js";

export default {
  name: "Domaines",
  fields: {
    domaines,
    "domaines.nsf": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd[].code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd[].intitule": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp[].code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp[].intitule": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.rome": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.rome.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.rome.rncp[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.rome.rncp[].code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.rome.rncp[].intitule": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.formacodes": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp[].code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp[].intitule": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
