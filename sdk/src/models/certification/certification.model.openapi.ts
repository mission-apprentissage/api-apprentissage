import type { SchemaObject } from "openapi3-ts/oas31";

import { certificationModelDoc } from "../../docs/models/certification/certification.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zCertification } from "./certification.model.js";
import { CFD_REGEX, RNCP_REGEX } from "./certification.primitives.js";

const schema: SchemaObject = {
  type: "object",
  properties: {
    identifiant: {
      type: "object",
      properties: {
        cfd: {
          anyOf: [
            {
              type: "string",
              pattern: CFD_REGEX.source,
            },
            { type: "null" },
          ],
        },
        rncp: {
          anyOf: [
            {
              type: "string",
              pattern: RNCP_REGEX.source,
            },
            { type: "null" },
          ],
        },
        rncp_anterieur_2019: {
          anyOf: [{ type: "boolean" }, { type: "null" }],
        },
      },
      required: ["cfd", "rncp", "rncp_anterieur_2019"],
      additionalProperties: false,
    },
    intitule: {
      type: "object",
      properties: {
        cfd: {
          anyOf: [
            {
              type: "object",
              properties: {
                long: {
                  type: "string",
                },
                court: {
                  type: "string",
                },
              },
              required: ["long", "court"],
              additionalProperties: false,
            },
            { type: "null" },
          ],
        },
        rncp: {
          anyOf: [{ type: "string" }, { type: "null" }],
        },
        niveau: {
          type: "object",
          properties: {
            cfd: {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    europeen: {
                      anyOf: [{ type: "string", enum: ["1", "2", "3", "4", "5", "6", "7", "8"] }, { type: "null" }],
                    },
                    formation_diplome: {
                      type: "string",
                    },
                    interministeriel: {
                      type: "string",
                    },
                    libelle: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                    },
                    sigle: {
                      type: "string",
                    },
                  },
                  required: ["europeen", "formation_diplome", "interministeriel", "libelle", "sigle"],
                  additionalProperties: false,
                },
                { type: "null" },
              ],
            },
            rncp: {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    europeen: {
                      anyOf: [{ type: "string", enum: ["1", "2", "3", "4", "5", "6", "7", "8"] }, { type: "null" }],
                    },
                  },
                  required: ["europeen"],
                  additionalProperties: false,
                },
                { type: "null" },
              ],
            },
          },
          required: ["cfd", "rncp"],
          additionalProperties: false,
        },
      },
      required: ["cfd", "niveau", "rncp"],
      additionalProperties: false,
    },
    base_legale: {
      type: "object",
      properties: {
        cfd: {
          anyOf: [
            {
              type: "object",
              properties: {
                creation: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
                abrogation: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
              },
              required: ["creation", "abrogation"],
              additionalProperties: false,
            },
            { type: "null" },
          ],
        },
      },
      required: ["cfd"],
      additionalProperties: false,
    },
    blocs_competences: {
      type: "object",
      properties: {
        rncp: {
          anyOf: [
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    pattern: "^(RNCP\\d{3,5}BC)?\\d{1,2}$",
                  },
                  intitule: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                },
                required: ["code", "intitule"],
                additionalProperties: false,
              },
            },
            { type: "null" },
          ],
        },
      },
      required: ["rncp"],
      additionalProperties: false,
    },
    convention_collectives: {
      type: "object",
      properties: {
        rncp: {
          anyOf: [
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  numero: { type: "string" },
                  intitule: {
                    type: "string",
                  },
                },
                required: ["numero", "intitule"],
                additionalProperties: false,
              },
            },
            { type: "null" },
          ],
        },
      },
      required: ["rncp"],
      additionalProperties: false,
    },
    domaines: {
      type: "object",
      properties: {
        formacodes: {
          type: "object",
          properties: {
            rncp: {
              anyOf: [
                {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      intitule: {
                        type: "string",
                      },
                    },
                    required: ["code", "intitule"],
                    additionalProperties: false,
                  },
                },
                { type: "null" },
              ],
            },
          },
          required: ["rncp"],
          additionalProperties: false,
        },
        nsf: {
          type: "object",
          properties: {
            cfd: {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    code: { type: "string" },
                    intitule: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                    },
                  },
                  required: ["code", "intitule"],
                  additionalProperties: false,
                },
                { type: "null" },
              ],
            },
            rncp: {
              anyOf: [
                {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        pattern: "^\\d{2,3}[a-z]?$",
                      },
                      intitule: {
                        anyOf: [{ type: "string" }, { type: "null" }],
                      },
                    },
                    required: ["code", "intitule"],
                    additionalProperties: false,
                  },
                },
                { type: "null" },
              ],
            },
          },
          required: ["cfd", "rncp"],
          additionalProperties: false,
        },
        rome: {
          type: "object",
          properties: {
            rncp: {
              anyOf: [
                {
                  type: "array",
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
                    additionalProperties: false,
                  },
                },
                { type: "null" },
              ],
            },
          },
          required: ["rncp"],
          additionalProperties: false,
        },
      },
      required: ["formacodes", "nsf", "rome"],
      additionalProperties: false,
    },
    periode_validite: {
      type: "object",
      properties: {
        debut: {
          anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
        },
        fin: {
          anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
        },
        cfd: {
          anyOf: [
            {
              type: "object",
              properties: {
                ouverture: {
                  anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                },
                fermeture: {
                  anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                },
                premiere_session: {
                  anyOf: [{ type: "integer" }, { type: "null" }],
                },
                derniere_session: {
                  anyOf: [{ type: "integer" }, { type: "null" }],
                },
              },
              required: ["ouverture", "fermeture", "premiere_session", "derniere_session"],
              additionalProperties: false,
            },
            { type: "null" },
          ],
        },
        rncp: {
          anyOf: [
            {
              type: "object",
              properties: {
                actif: {
                  type: "boolean",
                },
                activation: {
                  anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                },
                debut_parcours: {
                  anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                },
                fin_enregistrement: {
                  anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                },
              },
              required: ["actif", "activation", "debut_parcours", "fin_enregistrement"],
              additionalProperties: false,
            },
            { type: "null" },
          ],
        },
      },
      required: ["debut", "fin", "cfd", "rncp"],
      additionalProperties: false,
    },
    type: {
      type: "object",
      properties: {
        nature: {
          type: "object",
          properties: {
            cfd: {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    code: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                    },
                    libelle: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                    },
                  },
                  required: ["code", "libelle"],
                  additionalProperties: false,
                },
                { type: "null" },
              ],
            },
          },
          required: ["cfd"],
          additionalProperties: false,
        },
        gestionnaire_diplome: {
          anyOf: [{ type: "string" }, { type: "null" }],
        },
        enregistrement_rncp: {
          anyOf: [
            { type: "string", enum: ["Enregistrement de droit", "Enregistrement sur demande"] },
            { type: "null" },
          ],
        },
        voie_acces: {
          type: "object",
          properties: {
            rncp: {
              anyOf: [
                {
                  type: "object",
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
                  additionalProperties: false,
                },
                { type: "null" },
              ],
            },
          },
          required: ["rncp"],
          additionalProperties: false,
        },
        certificateurs_rncp: {
          anyOf: [
            {
              type: "array",
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
                additionalProperties: false,
              },
            },
            { type: "null" },
          ],
        },
      },
      required: ["nature", "gestionnaire_diplome", "enregistrement_rncp", "voie_acces", "certificateurs_rncp"],
      additionalProperties: false,
    },
    continuite: {
      type: "object",
      properties: {
        cfd: {
          anyOf: [
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ouverture: {
                    anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                  },
                  fermeture: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
                  code: {
                    type: "string",
                    pattern: "^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$",
                  },
                  courant: {
                    type: "boolean",
                  },
                },
                required: ["ouverture", "fermeture", "code", "courant"],
                additionalProperties: false,
              },
            },
            { type: "null" },
          ],
        },
        rncp: {
          anyOf: [
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activation: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
                  fin_enregistrement: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
                  code: { type: "string", pattern: "^RNCP\\d{3,5}$" },
                  courant: {
                    type: "boolean",
                  },
                  actif: {
                    type: "boolean",
                  },
                },
                required: ["activation", "fin_enregistrement", "code", "courant", "actif"],
                additionalProperties: false,
              },
            },
            { type: "null" },
          ],
        },
      },
      required: ["cfd", "rncp"],
      additionalProperties: false,
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
  additionalProperties: false,
};

export const certificationModelOpenapi: OpenapiModel<"Certification"> = {
  name: "Certification",
  schema,
  doc: certificationModelDoc,
  zod: zCertification,
};
