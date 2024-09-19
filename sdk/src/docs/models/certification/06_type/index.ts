import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import typeField from "./type/index.js";

export default {
  name: "Type",
  fields: {
    type: typeField,
    "type.nature": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.nature.cfd": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.nature.cfd.code": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.nature.cfd.libelle": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.gestionnaire_diplome": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.enregistrement_rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.apprentissage": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.experience": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.candidature_individuelle": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.contrat_professionnalisation": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.formation_continue": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.rncp.formation_statut_eleve": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp[]": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp[].siret": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
    "type.voie_acces.certificateurs_rncp[].nom": <DocTechnicalField>{
      type: "technical",
      description: "",
      notes: null,
    },
  },
} as const satisfies DocBusinessSection;
