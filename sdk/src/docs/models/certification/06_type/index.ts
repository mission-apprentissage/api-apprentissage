import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import typeField from "./type/index.js";

export default {
  name: "Type",
  fields: {
    type: typeField,
    "type.nature": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.nature.cfd": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.nature.cfd.code": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.nature.cfd.libelle": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.gestionnaire_diplome": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.enregistrement_rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.apprentissage": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.experience": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.candidature_individuelle": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.contrat_professionnalisation": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.formation_continue": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.formation_statut_eleve": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp[]": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp[].siret": <DocTechnicalField>{
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp[].nom": <DocTechnicalField>{
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
