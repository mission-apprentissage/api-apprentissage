import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import domaines from "./domaines/index.js";

export default {
  name: "Domaines",
  fields: {
    domaines,
    "domaines.nsf": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.cfd[].intitule": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.nsf.rncp[].intitule": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.rome": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.rome.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.rome.rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.rome.rncp[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.rome.rncp[].intitule": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.formacodes": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp[].code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "domaines.formacodes.rncp[].intitule": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
