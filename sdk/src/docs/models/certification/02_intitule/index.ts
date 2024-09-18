import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import intituleNiveau from "./intitule.niveau/index.js";
import intitule from "./intitule/index.js";

export default {
  name: "Intitulé",
  fields: {
    intitule: intitule,
    "intitule.cfd": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.cfd.court": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.cfd.long": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau": intituleNiveau,
    "intitule.niveau.cfd": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.sigle": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.europeen": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.formation_diplome": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.libelle": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.interministeriel": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "intitule.niveau.rncp.europeen": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
