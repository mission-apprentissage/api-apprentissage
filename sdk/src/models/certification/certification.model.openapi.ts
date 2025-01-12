import type { SchemaObject } from "openapi3-ts/oas31";

import { certificationModelDoc } from "../../docs/models/certification/certification.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { CFD_REGEX, RNCP_REGEX } from "./certification.primitives.js";

const schema: SchemaObject = {
  type: "object",
  properties: {
    identifiant: {
      type: "object",
      properties: {
        cfd: {
          type: ["string", "null"],
          pattern: CFD_REGEX.source,
        },
        rncp: {
          type: ["string", "null"],
          pattern: RNCP_REGEX.source,
        },
        rncp_anterieur_2019: {
          type: ["boolean", "null"],
        },
      },
      required: ["cfd", "rncp", "rncp_anterieur_2019"],
    },
    intitule: {
      type: "object",
      properties: {
        cfd: {
          type: ["object", "null"],
          properties: {
            long: {
              type: "string",
            },
            court: {
              type: "string",
            },
          },
          required: ["long", "court"],
        },
        rncp: {
          type: ["string", "null"],
        },
        niveau: {
          type: "object",
          properties: {
            cfd: {
              type: ["object", "null"],
              properties: {
                europeen: {
                  type: ["string", "null"],
                  enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
                },
                formation_diplome: {
                  type: "string",
                },
                interministeriel: {
                  type: "string",
                },
                libelle: {
                  type: ["string", "null"],
                },
                sigle: {
                  type: "string",
                },
              },
              required: ["europeen", "formation_diplome", "interministeriel", "libelle", "sigle"],
            },
            rncp: {
              type: ["object", "null"],
              properties: {
                europeen: {
                  type: ["string", "null"],
                  enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
                },
              },
              required: ["europeen"],
            },
          },
          required: ["cfd", "rncp"],
        },
      },
      required: ["cfd", "niveau", "rncp"],
    },
    base_legale: {
      type: "object",
      properties: {
        cfd: {
          type: ["object", "null"],
          properties: {
            creation: {
              type: ["string", "null"],
              format: "date-time",
            },
            abrogation: {
              type: ["string", "null"],
              format: "date-time",
            },
          },
          required: ["creation", "abrogation"],
        },
      },
      required: ["cfd"],
    },
    blocs_competences: {
      type: "object",
      properties: {
        rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              code: {
                type: "string",
                pattern: "^(RNCP\\d{3,5}BC)?\\d{1,2}$",
              },
              intitule: {
                type: ["string", "null"],
              },
            },
            required: ["code", "intitule"],
          },
        },
      },
      required: ["rncp"],
    },
    convention_collectives: {
      type: "object",
      properties: {
        rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              numero: { type: "string" },
              intitule: {
                type: "string",
              },
            },
            required: ["numero", "intitule"],
          },
        },
      },
      required: ["rncp"],
    },
    domaines: {
      type: "object",
      properties: {
        formacodes: {
          type: "object",
          properties: {
            rncp: {
              type: ["array", "null"],
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  intitule: {
                    type: "string",
                  },
                },
                required: ["code", "intitule"],
              },
            },
          },
          required: ["rncp"],
        },
        nsf: {
          type: "object",
          properties: {
            cfd: {
              type: ["object", "null"],
              properties: {
                code: { type: "string" },
                intitule: {
                  type: ["string", "null"],
                },
              },
              required: ["code", "intitule"],
            },
            rncp: {
              type: ["array", "null"],
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    pattern: "^\\d{2,3}[a-z]?$",
                  },
                  intitule: {
                    type: ["string", "null"],
                  },
                },
                required: ["code", "intitule"],
              },
            },
          },
          required: ["cfd", "rncp"],
        },
        rome: {
          type: "object",
          properties: {
            rncp: {
              type: ["array", "null"],
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    pattern: "^[A-Z]{1}\\d{0,4}$",
                  },
                  intitule: {
                    type: "string",
                  },
                },
                required: ["code", "intitule"],
              },
            },
          },
          required: ["rncp"],
        },
      },
      required: ["formacodes", "nsf", "rome"],
    },
    periode_validite: {
      type: "object",
      properties: {
        debut: {
          type: ["string", "null"],
          format: "date-time",
        },
        fin: {
          type: ["string", "null"],
          format: "date-time",
        },
        cfd: {
          type: ["object", "null"],
          properties: {
            ouverture: {
              type: ["string", "null"],
              format: "date-time",
            },
            fermeture: {
              type: ["string", "null"],
              format: "date-time",
            },
            premiere_session: {
              type: ["integer", "null"],
            },
            derniere_session: {
              type: ["integer", "null"],
            },
          },
          required: ["ouverture", "fermeture", "premiere_session", "derniere_session"],
        },
        rncp: {
          type: ["object", "null"],
          properties: {
            actif: {
              type: "boolean",
            },
            activation: {
              type: ["string", "null"],
              format: "date-time",
            },
            debut_parcours: {
              type: ["string", "null"],
              format: "date-time",
            },
            fin_enregistrement: {
              type: ["string", "null"],
              format: "date-time",
            },
          },
          required: ["actif", "activation", "debut_parcours", "fin_enregistrement"],
        },
      },
      required: ["debut", "fin", "cfd", "rncp"],
    },
    type: {
      type: "object",
      properties: {
        nature: {
          type: "object",
          properties: {
            cfd: {
              type: ["object", "null"],
              properties: {
                code: {
                  type: ["string", "null"],
                },
                libelle: {
                  type: ["string", "null"],
                },
              },
              required: ["code", "libelle"],
            },
          },
          required: ["cfd"],
        },
        gestionnaire_diplome: {
          type: ["string", "null"],
        },
        enregistrement_rncp: {
          type: ["string", "null"],
          enum: ["Enregistrement de droit", "Enregistrement sur demande"],
        },
        voie_acces: {
          type: "object",
          properties: {
            rncp: {
              type: ["object", "null"],
              properties: {
                apprentissage: {
                  type: "boolean",
                },
                experience: {
                  type: "boolean",
                },
                candidature_individuelle: {
                  type: "boolean",
                },
                contrat_professionnalisation: {
                  type: "boolean",
                },
                formation_continue: {
                  type: "boolean",
                },
                formation_statut_eleve: {
                  type: "boolean",
                },
              },
              required: [
                "apprentissage",
                "experience",
                "candidature_individuelle",
                "contrat_professionnalisation",
                "formation_continue",
                "formation_statut_eleve",
              ],
            },
          },
          required: ["rncp"],
        },
        certificateurs_rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              siret: {
                type: "string",
              },
              nom: {
                type: "string",
              },
            },
            required: ["siret", "nom"],
          },
        },
      },
      required: ["nature", "gestionnaire_diplome", "enregistrement_rncp", "voie_acces", "certificateurs_rncp"],
    },
    continuite: {
      type: "object",
      properties: {
        cfd: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              ouverture: {
                type: ["string", "null"],
                format: "date-time",
              },
              fermeture: {
                type: ["string", "null"],
                format: "date-time",
              },
              code: {
                type: "string",
                pattern: "^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$",
              },
              courant: {
                type: "boolean",
              },
            },
            required: ["ouverture", "fermeture", "code", "courant"],
          },
        },
        rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              activation: {
                type: ["string", "null"],
                format: "date-time",
              },
              fin_enregistrement: {
                type: ["string", "null"],
                format: "date-time",
              },
              code: { type: "string", pattern: "^RNCP\\d{3,5}$" },
              courant: {
                type: "boolean",
              },
              actif: {
                type: "boolean",
              },
            },
            required: ["activation", "fin_enregistrement", "code", "courant", "actif"],
          },
        },
      },
      required: ["cfd", "rncp"],
    },
  },
  required: [
    "identifiant",
    "intitule",
    "base_legale",
    "blocs_competences",
    "convention_collectives",
    "domaines",
    "periode_validite",
    "type",
    "continuite",
  ],
};

export const certificationModelOpenapi = {
  name: "Certification",
  schema,
  doc: certificationModelDoc,
} as const satisfies OpenapiModel;
