import type { OpenApiBuilder, SchemaObject } from "openapi3-ts/oas31";

import { certificationModelDoc } from "../../docs/models/certification/certification.model.doc.js";
import { buildOpenApiDescriptionLegacy, getDocOpenAPIAttributes } from "../../utils/zodWithOpenApi.js";
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
          description: buildOpenApiDescriptionLegacy("Code Formation Diplôme (CFD) de la certification.", [
            "- `null` si et seulement si aucun diplôme CFD correspondant à la fiche RNCP (`identifiant.rncp`) n'est connu.",
            "- Lorsque le code est `null`, toutes les informations issues de la base centrale des nomenclatures (BCN) seront `null`.",
          ]),
          examples: ["50022137"],
        },
        rncp: {
          type: ["string", "null"],
          pattern: RNCP_REGEX.source,
          description: buildOpenApiDescriptionLegacy(
            "Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.",
            [
              "- `null` si et seulement si aucune fiche RNCP correspondant au diplôme (`identifiant.cfd`) n'est connu.",
              "- Lorsque le code est `null`, toutes les informations issues de France Compétence seront `null`",
            ]
          ),
          examples: ["RNCP37537"],
        },
        rncp_anterieur_2019: {
          type: ["boolean", "null"],
          description: buildOpenApiDescriptionLegacy(
            "Identifie les certifications dont le code RNCP correspond à une fiche antérieure à la réforme de 2019.",
            [
              "- `null` si `identifiant.rncp` est `null`",
              "- `true` si le numéro de fiche `identifiant.rncp` est inférieur à `34,000`",
              "- `false` sinon",
            ]
          ),
        },
      },
      required: ["cfd", "rncp", "rncp_anterieur_2019"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[0].fields.identifiant),
    },
    intitule: {
      type: "object",
      properties: {
        cfd: {
          type: ["object", "null"],
          properties: {
            long: {
              type: "string",
              description: "**Intitulé long du diplôme.**",
              examples: ["BOULANGER (CAP)", "GENIE BIOLOGIQUE OPTION AGRONOMIE (DUT)"],
            },
            court: {
              type: "string",
              description: "**Intitulé court du diplôme.**",
              examples: ["BOULANGER", "GENIE BIO - AGRONOMIE"],
            },
          },
          required: ["long", "court"],
          description: buildOpenApiDescriptionLegacy(
            "Intitulés de la certification issue de la base centrale des nomenclatures (BCN).",
            ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
          ),
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
                  description: buildOpenApiDescriptionLegacy(
                    "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                    [
                      "- peut être `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens ou qu'elle n'est pas déterminée.",
                      "- lorsque la fiche RNCP correspondante est connue, il faut priviliégier le niveau européen issue de France Compétences.",
                    ]
                  ),
                  examples: ["3", "5"],
                },
                formation_diplome: {
                  type: "string",
                  description: buildOpenApiDescriptionLegacy(
                    "Code à 3 caractères qui renseigne sur le niveau du diplôme suivant le référentiel de l'Éducation Nationale.",
                    ["- correspond aux 3 premiers caractères du code CFD."]
                  ),
                  examples: ["500", "370"],
                },
                interministeriel: {
                  type: "string",
                  description:
                    "code interministériel du niveau de la formation suivant le référentiel de l'Éducation Nationale.\n\nNotes:\n\n- correspond au premier caractère du code CFD, sauf pour le CFD `01321401`",
                  examples: ["3", "6"],
                },
                libelle: {
                  type: ["string", "null"],
                  examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
                },
                sigle: {
                  type: "string",
                  examples: ["CAP", "DUT", "BTS", "CPGE"],
                },
              },
              required: ["europeen", "formation_diplome", "interministeriel", "libelle", "sigle"],
              description: buildOpenApiDescriptionLegacy(
                "Niveau de la certification issue de la base centrale des nomenclatures (BCN).",
                ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
              ),
            },
            rncp: {
              type: ["object", "null"],
              properties: {
                europeen: {
                  type: ["string", "null"],
                  enum: ["1", "2", "3", "4", "5", "6", "7", "8"],
                  description: buildOpenApiDescriptionLegacy(
                    "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                    ["- `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens."]
                  ),
                  example: "3",
                },
              },
              required: ["europeen"],
              description: buildOpenApiDescriptionLegacy("Niveau de qualification issue de France Compétences.", [
                "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              ]),
            },
          },
          required: ["cfd", "rncp"],
          ...getDocOpenAPIAttributes(certificationModelDoc.sections[2].fields["intitule.niveau"]),
        },
        rncp: {
          type: ["string", "null"],
          description: buildOpenApiDescriptionLegacy("Intitulé de la certification issue de France Compétences.", [
            "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          ]),
          example: "Boulanger",
        },
      },
      required: ["cfd", "niveau", "rncp"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[2].fields["intitule"]),
    },
    base_legale: {
      type: "object",
      properties: {
        cfd: {
          type: ["object", "null"],
          properties: {
            creation: {
              type: ["string", "null"],
              description: buildOpenApiDescriptionLegacy("Date d'arrêté de création du diplôme.", [
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
                "- La date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
              ]),
              format: "date-time",
              examples: ["2014-02-21T00:00:00.000+01:00", "2018-05-11T00:00:00.000+02:00"],
            },
            abrogation: {
              type: ["string", "null"],
              description: buildOpenApiDescriptionLegacy("Date d'arrêté d'abrogation du diplôme.", [
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                "- La date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
              ]),
              format: "date-time",
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
          },
          required: ["creation", "abrogation"],
          description: buildOpenApiDescriptionLegacy(
            "Informations légales issue de la base centrale des nomenclatures (BCN) relatives au diplôme.",
            ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
          ),
        },
      },
      required: ["cfd"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[7].fields["base_legale"]),
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
                example: "RNCP37537BC01",
              },
              intitule: {
                type: ["string", "null"],
                example: "Approvisionnement, communication, sécurité alimentaire et hygiène en boulangerie",
              },
            },
            required: ["code", "intitule"],
          },
          description: buildOpenApiDescriptionLegacy("Liste des blocs de compétences issue de France Compétences.", [
            "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          ]),
        },
      },
      required: ["rncp"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[4].fields["blocs_competences"]),
    },
    convention_collectives: {
      type: "object",
      properties: {
        rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              numero: { type: "string", example: "3002" },
              intitule: {
                type: "string",
                example: "Bâtiment (Employés, techniciens et agents de maîtrise, ingénieurs, assimilés et cadres)",
              },
            },
            required: ["numero", "intitule"],
          },
          description: buildOpenApiDescriptionLegacy("Liste des conventions collectives issue de France Compétences.", [
            "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          ]),
        },
      },
      required: ["rncp"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[8].fields["conventions_collectives"]),
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
                  code: { type: "string", example: "21538" },
                  intitule: {
                    type: "string",
                    example: "21538 : Boulangerie",
                  },
                },
                required: ["code", "intitule"],
              },
              description:
                "Formacode® issue de France Compétences.\n\nNotes:\n\n- `null` lorsque le champs `identifiant.rncp` est `null`.",
            },
          },
          required: ["rncp"],
          description: buildOpenApiDescriptionLegacy("Formacode® issue de France Compétences.", [
            "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          ]),
        },
        nsf: {
          type: "object",
          properties: {
            cfd: {
              type: ["object", "null"],
              properties: {
                code: { type: "string", examples: ["221", "310"] },
                intitule: {
                  type: ["string", "null"],
                  examples: ["AGRO-ALIMENTAIRE, ALIMENTATION, CUISINE", "SPECIALIT.PLURIV.DES ECHANGES & GESTION"],
                },
              },
              required: ["code", "intitule"],
              description: buildOpenApiDescriptionLegacy("NSF issue de la base centrale des nomenclatures (BCN).", [
                "- `null` lorsque le champs `identifiant.cfd` est `null`.",
                "- Le code NSF est déduis du code formation diplôme (CFD), il n'inclut donc pas la lettre de spécialité et le tableau ne contient qu'un seul élément.",
              ]),
            },
            rncp: {
              type: ["array", "null"],
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    pattern: "^\\d{2,3}[a-z]?$",
                    example: "221",
                  },
                  intitule: {
                    type: ["string", "null"],
                    example: "221 : Agro-alimentaire, alimentation, cuisine",
                  },
                },
                required: ["code", "intitule"],
              },
              description: buildOpenApiDescriptionLegacy("NSF issue de France Compétences.", [
                "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              ]),
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
                    pattern: "^[A-Z]{1}\\d{2,4}$",
                    example: "D1102",
                  },
                  intitule: {
                    type: "string",
                    example: "Boulangerie - viennoiserie",
                  },
                },
                required: ["code", "intitule"],
              },
              description: buildOpenApiDescriptionLegacy("ROME issue de France Compétences.", [
                "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              ]),
            },
          },
          required: ["rncp"],
          description: "Répertoire Opérationnel des Métiers et des Emplois (ROME).",
        },
      },
      required: ["formacodes", "nsf", "rome"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[5].fields["domaines"]),
    },
    periode_validite: {
      type: "object",
      properties: {
        debut: {
          type: ["string", "null"],
          format: "date-time",
          description: buildOpenApiDescriptionLegacy(
            "Date de début de validité de la certification. Cette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP.",
            [
              "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
            ]
          ),
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        },
        fin: {
          type: ["string", "null"],
          format: "date-time",
          description:
            "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
          examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
        },
        cfd: {
          type: ["object", "null"],
          properties: {
            ouverture: {
              type: ["string", "null"],
              format: "date-time",
              description: buildOpenApiDescriptionLegacy("Date d'ouverture du diplôme.", [
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
              ]),
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            fermeture: {
              type: ["string", "null"],
              description: buildOpenApiDescriptionLegacy("Date de fermeture du diplôme.", [
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
              ]),
              format: "date-time",
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
            premiere_session: {
              type: ["integer", "null"],
              description: "Année de sortie des premiers diplômés.",
              example: 2022,
            },
            derniere_session: {
              type: ["integer", "null"],
              description: "Année de sortie des derniers diplômés.",
              example: 2025,
            },
          },
          required: ["ouverture", "fermeture", "premiere_session", "derniere_session"],
          ...getDocOpenAPIAttributes(certificationModelDoc.sections[1].fields["periode_validite.cfd"]),
        },
        rncp: {
          type: ["object", "null"],
          properties: {
            actif: {
              type: "boolean",
              description:
                "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
            },
            activation: {
              type: ["string", "null"],
              description: buildOpenApiDescriptionLegacy(
                "Date à laquelle la fiche RNCP est passée au statut `actif`.",
                [
                  "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
                  "- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
                ]
              ),
              format: "date-time",
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            debut_parcours: {
              type: ["string", "null"],
              description: buildOpenApiDescriptionLegacy(
                "Date de début des parcours certifiants. Anciennement appelée 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.",
                ["La date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris."]
              ),
              format: "date-time",
            },
            fin_enregistrement: {
              type: ["string", "null"],
              description: buildOpenApiDescriptionLegacy("Date de fin d’enregistrement d’une fiche au RNCP.", [
                "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
              ]),
              format: "date-time",
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
          },
          required: ["actif", "activation", "debut_parcours", "fin_enregistrement"],
          ...getDocOpenAPIAttributes(certificationModelDoc.sections[1].fields["periode_validite.rncp"]),
        },
      },
      required: ["debut", "fin", "cfd", "rncp"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[1].fields["periode_validite"]),
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
                  examples: ["1", "2", "P"],
                },
                libelle: {
                  type: ["string", "null"],
                  examples: [
                    "DIPLOME NATIONAL / DIPLOME D'ETAT",
                    "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
                    "CLASSE PREPA",
                  ],
                },
              },
              required: ["code", "libelle"],
              description: buildOpenApiDescriptionLegacy(
                "Nature du diplôme issue de la base centrale des nomenclatures (BCN).",
                ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
              ),
            },
          },
          required: ["cfd"],
          description: "Nature du diplôme.",
        },
        gestionnaire_diplome: {
          type: ["string", "null"],
          description: buildOpenApiDescriptionLegacy("Service responsable de la définition du diplôme.", [
            "- `null` lorsque le champs `identifiant.cfd` est `null`.",
          ]),
          example: "DGESCO A2-3",
        },
        enregistrement_rncp: {
          type: ["string", "null"],
          enum: ["Enregistrement de droit", "Enregistrement sur demande"],
          description: buildOpenApiDescriptionLegacy(
            "Permet de savoir si la certification est enregistrée de droit ou sur demande au Repertoire National des Certifications Professionnelles (RNCP)",
            ["- `null` lorsque le champs `identifiant.rncp` est `null`."]
          ),
          example: "Enregistrement de droit",
        },
        voie_acces: {
          type: "object",
          properties: {
            rncp: {
              type: ["object", "null"],
              properties: {
                apprentissage: {
                  type: "boolean",
                  description: "Certification accessible en contrat d’apprentissage.",
                },
                experience: {
                  type: "boolean",
                  description: "Certification accessible par expérience.",
                },
                candidature_individuelle: {
                  type: "boolean",
                  description: "Certification accessible par candidature individuelle.",
                },
                contrat_professionnalisation: {
                  type: "boolean",
                  description: "Certification accessible en contrat de professionnalisation.",
                },
                formation_continue: {
                  type: "boolean",
                  description: "Certification accessible après un parcours de formation continue.",
                },
                formation_statut_eleve: {
                  type: "boolean",
                  description:
                    "Certification accessible après un parcours de formation sous statut d’élève ou d’étudiant.",
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
              description: buildOpenApiDescriptionLegacy(
                "Voie d’accès à la certification issue de France Compétences.",
                ["- `null` lorsque le champs `identifiant.rncp` est `null`."]
              ),
            },
          },
          required: ["rncp"],
          description: "Voie d’accès à la certification.",
        },
        certificateurs_rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              siret: {
                type: "string",
                description: "Numéro SIRET du certificateur renseigné dans le RNCP.",
              },
              nom: {
                type: "string",
                description: "Nom du certificateur renseigné dans le RNCP.",
              },
            },
            required: ["siret", "nom"],
          },
          description: buildOpenApiDescriptionLegacy("Liste des certificateurs de la fiche RNCP.", [
            "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          ]),
        },
      },
      required: ["nature", "gestionnaire_diplome", "enregistrement_rncp", "voie_acces", "certificateurs_rncp"],
      ...getDocOpenAPIAttributes(certificationModelDoc.sections[6].fields["type"]),
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
                description:
                  "Date d'ouverture du diplôme.\n\nNotes:\n\n- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
                format: "date-time",
                examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
              },
              fermeture: {
                type: ["string", "null"],
                description:
                  "Date de fermeture du diplôme.\n\nNotes:\n\n- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                format: "date-time",
                examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
              },
              code: {
                type: "string",
                pattern: "^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$",
              },
              courant: {
                type: "boolean",
                description:
                  "Indique si le diplôme correspond au diplôme courant, i.e `identifiant.cfd` est égal au `code`.",
              },
            },
            required: ["ouverture", "fermeture", "code", "courant"],
          },
          description: buildOpenApiDescriptionLegacy(
            "Liste des diplômes assurant la continuité du diplôme. La liste inclut à la fois les diplômes remplacés et remplaçant. La liste est ordonnée par date d'ouverture du diplôme et inclut le diplôme courant.",
            [
              "- `null` lorsque le champs `identifiant.cfd` est `null`.",
              "- Pour distinguer les diplômes remplacés des diplômes remplaçant, il faut se référer aux dates d'ouverture et de fermeture des diplômes.",
            ]
          ),
        },
        rncp: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              activation: {
                type: ["string", "null"],
                description:
                  "Date à laquelle la fiche RNCP est passée au statut `actif`.\n\nNotes:\n\n- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.\n\n- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
                format: "date-time",
                examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
              },
              fin_enregistrement: {
                type: ["string", "null"],
                description:
                  "Date de fin d’enregistrement d’une fiche au RNCP.\n\nNotes:\n\n- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                format: "date-time",
                examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
              },
              code: { type: "string", pattern: "^RNCP\\d{3,5}$" },
              courant: {
                type: "boolean",
                description:
                  "Indique si la fiche correspond à la fiche courante, i.e `identifiant.rncp` est égal au `code`.",
              },
              actif: {
                type: "boolean",
                description:
                  "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
              },
            },
            required: ["activation", "fin_enregistrement", "code", "courant", "actif"],
          },
          ...getDocOpenAPIAttributes(certificationModelDoc.sections[3].fields["continuite"]),
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

export function registerOpenApiCertificationSchema(builder: OpenApiBuilder): OpenApiBuilder {
  return builder.addSchema("Certification", schema);
}
