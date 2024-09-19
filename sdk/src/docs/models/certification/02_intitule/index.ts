import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import intituleNiveau from "./intitule.niveau/index.js";
import intitule from "./intitule/index.js";

export default {
  name: "Intitulé",
  fields: {
    intitule: intitule,
    "intitule.cfd": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.cfd.court": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.cfd.long": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau": intituleNiveau,
    "intitule.niveau.cfd": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.sigle": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.europeen": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.formation_diplome": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.libelle": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.cfd.interministeriel": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "intitule.niveau.rncp.europeen": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
