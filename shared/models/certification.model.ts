import { z } from "zod";

import { certificationDoc } from "../docs/certification/certification.doc";
import {
  zCfd,
  zNiveauDiplomeEuropeen,
  zNsfCode,
  zRncp,
  zRncpBlocCompetenceCode,
  zTypeEnregistrement,
} from "../zod/certifications.primitives";
import { zLocalDate } from "../zod/date.primitives";
import { buildOpenApiDescription, zodOpenApi } from "../zod/zodWithOpenApi";
import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "certifications" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ "identifiant.cfd": 1, "identifiant.rncp": 1 }, {}],
  [{ "identifiant.rncp": 1, "identifiant.cfd": 1 }, {}],
];

const zCertifIdentifiant = zodOpenApi
  .object({
    cfd: zCfd.nullable().openapi({
      description: buildOpenApiDescription("Code Formation Diplôme (CFD) de la certification.", [
        "- `null` si et seulement si aucun diplôme CFD correspondant à la fiche RNCP (`identifiant.rncp`) n'est connu.",
        "- Lorsque le code est `null`, toutes les informations issues de la base centrale des nomenclatures (BCN) seront `null`.",
      ]),
      example: "50022137",
    }),
    rncp: zRncp.nullable().openapi({
      description: buildOpenApiDescription(
        "Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.",
        [
          "- `null` si et seulement si aucune fiche RNCP correspondant au diplôme (`identifiant.cfd`) n'est connu.",
          "- Lorsque le code est `null`, toutes les informations issues de France Compétence seront `null`",
        ]
      ),
      example: "RNCP37537",
    }),
    rncp_anterieur_2019: zodOpenApi
      .boolean()
      .nullable()
      .openapi({
        description: buildOpenApiDescription(
          "Identifie les certifications dont le code RNCP correspond à une fiche antérieure à la réforme de 2019.",
          [
            "- `null` si `identifiant.rncp` est `null`",
            "- `true` si le numéro de fiche `identifiant.rncp` est inférieur à `34,000`",
            "- `false` sinon",
          ]
        ),
      }),
  })
  .openapi({
    description: buildOpenApiDescription(certificationDoc.identifiantTopologie.fields.identifiantField.description, [
      "- les fiches RNCP antérieures à la réforme de 2019 ont certaines données qui ne sont pas renseignées, elles sont identifiées par le champ `rncp_anterieur_2019` à `true`.",
    ]),
  });

const zCertifPeriodeValidite = zodOpenApi
  .object({
    debut: zLocalDate.nullable().openapi({
      description: buildOpenApiDescription(
        "Date de début de validité de la certification. Cette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP.",
        [
          "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
        ]
      ),
      examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
    }),
    fin: zLocalDate.nullable().openapi({
      description:
        "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
      examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
    }),
    cfd: zodOpenApi
      .object({
        ouverture: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription("Date d'ouverture du diplôme.", [
            "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
          ]),
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        }),
        fermeture: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription("Date de fermeture du diplôme.", [
            "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
          ]),
          examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
        }),
        premiere_session: z.number().int().nullable().openapi({
          description: "Année de sortie des premiers diplômés.",
          example: 2022,
        }),
        derniere_session: z.number().int().nullable().openapi({
          description: "Année de sortie des derniers diplômés.",
          example: 2025,
        }),
      })
      .nullable()
      .openapi({
        description: buildOpenApiDescription(
          certificationDoc.periodeValiditeTopologie.fields.periodeValiditeCfdField.description,
          ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
        ),
      }),
    rncp: zodOpenApi
      .object({
        actif: zodOpenApi.boolean().openapi({
          description:
            "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
        }),
        activation: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription("Date à laquelle la fiche RNCP est passée au statut `actif`.", [
            "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
            "- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
          ]),
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        }),
        debut_parcours: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription(
            "Date de début des parcours certifiants. Anciennement appelée 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.",
            ["La date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris."]
          ),
        }),
        fin_enregistrement: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription("Date de fin d’enregistrement d’une fiche au RNCP.", [
            "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
          ]),
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        }),
      })
      .nullable()
      .openapi({
        description: buildOpenApiDescription(
          certificationDoc.periodeValiditeTopologie.fields.periodeValiditeRncpField.description,
          ["- `null` lorsque le champs `identifiant.rncp` est `null`."]
        ),
      }),
  })
  .openapi({
    description: buildOpenApiDescription(
      certificationDoc.periodeValiditeTopologie.fields.periodeValiditeField.description,
      ["Les dates sont retournées au format ISO 8601 avec le fuseau horaire Europe/Paris."]
    ),
  });

const zCertifIntitule = zodOpenApi
  .object({
    cfd: zodOpenApi
      .object({
        long: zodOpenApi.string().openapi({
          description: "**Intitulé long du diplôme.**",
          examples: ["BOULANGER (CAP)", "GENIE BIOLOGIQUE OPTION AGRONOMIE (DUT)"],
        }),
        court: zodOpenApi.string().openapi({
          description: "**Intitulé court du diplôme.**",
          examples: ["BOULANGER", "GENIE BIO - AGRONOMIE"],
        }),
      })
      .nullable()
      .openapi({
        description:
          "**Intitulé du diplôme.**\n\nLa base centrale des nomenclatures (BCN) fournie un intitulé long et court du diplôme.",
      })
      .openapi({
        description: buildOpenApiDescription(
          "Intitulés de la certification issue de la base centrale des nomenclatures (BCN).",
          ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
        ),
      }),
    niveau: zodOpenApi
      .object({
        cfd: zodOpenApi
          .object({
            europeen: zNiveauDiplomeEuropeen.nullable().openapi({
              description: buildOpenApiDescription(
                "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                [
                  "- peut être `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens ou qu'elle n'est pas déterminée.",
                  "- lorsque la fiche RNCP correspondante est connue, il faut priviliégier le niveau européen issue de France Compétences.",
                ]
              ),
              examples: ["3", "5"],
            }),
            formation_diplome: zodOpenApi.string().openapi({
              description: buildOpenApiDescription(
                "Code à 3 caractères qui renseigne sur le niveau du diplôme suivant le référentiel de l'Éducation Nationale.",
                ["- correspond aux 3 premiers caractères du code CFD."]
              ),
              examples: ["500", "370"],
            }),
            interministeriel: zodOpenApi.string().openapi({
              description: buildOpenApiDescription(
                "code interministériel du niveau de la formation suivant le référentiel de l'Éducation Nationale.",
                ["- correspond au premier caractère du code CFD, sauf pour le CFD `01321401`"]
              ),
              examples: ["3", "6"],
            }),
            libelle: zodOpenApi
              .string()
              .nullable()
              .openapi({
                examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
              }),
            sigle: zodOpenApi.string().openapi({
              examples: ["CAP", "DUT", "BTS", "CPGE"],
            }),
          })
          .nullable()
          .openapi({
            description: buildOpenApiDescription(
              "Niveau de la certification issue de la base centrale des nomenclatures (BCN).",
              ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
            ),
          }),
        rncp: zodOpenApi
          .object({
            europeen: zNiveauDiplomeEuropeen.nullable().openapi({
              description: buildOpenApiDescription(
                "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                ["- `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens."]
              ),
              example: "3",
            }),
          })
          .nullable()
          .openapi({
            description: buildOpenApiDescription("Niveau de qualification issue de France Compétences.", [
              "- `null` lorsque le champs `identifiant.rncp` est `null`.",
            ]),
          }),
      })
      .openapi({
        description: buildOpenApiDescription(certificationDoc.intituleTopologie.fields.intituleNiveauField.description),
      }),
    rncp: zodOpenApi
      .string()
      .openapi({
        example: "Boulanger",
      })
      .nullable()
      .openapi({
        description: buildOpenApiDescription("Intitulé de la certification issue de France Compétences.", [
          "- `null` lorsque le champs `identifiant.rncp` est `null`.",
        ]),
      }),
  })
  .openapi({
    description: certificationDoc.intituleTopologie.fields.intituleField.description,
  });

const zCertifBlocsCompetences = zodOpenApi
  .object({
    rncp: zodOpenApi
      .array(
        zodOpenApi.object({
          code: zRncpBlocCompetenceCode,
          intitule: zodOpenApi.string().nullable().openapi({
            example: "Approvisionnement, communication, sécurité alimentaire et hygiène en boulangerie",
          }),
        })
      )
      .nullable()
      .openapi({
        description: buildOpenApiDescription("Liste des blocs de compétences issue de France Compétences.", [
          "- `null` lorsque le champs `identifiant.rncp` est `null`.",
        ]),
      }),
  })
  .openapi({
    description: certificationDoc.blocsCompetencesTopologie.fields.blocsCompetencesField.description,
  });

const zCertifDomaines = zodOpenApi
  .object({
    formacodes: zodOpenApi
      .object({
        rncp: zodOpenApi
          .array(
            zodOpenApi.object({
              code: zodOpenApi.string().openapi({
                example: "21538",
              }),
              intitule: zodOpenApi.string().openapi({
                example: "21538 : Boulangerie",
              }),
            })
          )
          .nullable()
          .openapi({
            description: buildOpenApiDescription("Formacode® issue de France Compétences.", [
              "- `null` lorsque le champs `identifiant.rncp` est `null`.",
            ]),
          }),
      })
      .openapi({
        description: "Formacode®, thésaurus de l’offre de formation du Centre Inffo.",
      }),
    nsf: zodOpenApi.object({
      cfd: zodOpenApi
        .object({
          code: zodOpenApi.string().openapi({
            examples: ["221", "310"],
          }),
          intitule: zodOpenApi
            .string()
            .nullable()
            .openapi({
              examples: ["AGRO-ALIMENTAIRE, ALIMENTATION, CUISINE", "SPECIALIT.PLURIV.DES ECHANGES & GESTION"],
            }),
        })
        .nullable()
        .openapi({
          description: buildOpenApiDescription("NSF issue de la base centrale des nomenclatures (BCN).", [
            "- `null` lorsque le champs `identifiant.cfd` est `null`.",
            "- Le code NSF est déduis du code formation diplôme (CFD), il n'inclut donc pas la lettre de spécialité et le tableau ne contient qu'un seul élément.",
          ]),
        }),
      rncp: zodOpenApi
        .array(
          z.object({
            code: zNsfCode,
            intitule: zodOpenApi.string().nullable().openapi({
              example: "221 : Agro-alimentaire, alimentation, cuisine",
            }),
          })
        )
        .nullable()
        .openapi({
          description: buildOpenApiDescription("NSF issue de France Compétences.", [
            "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          ]),
        }),
    }),
    rome: zodOpenApi
      .object({
        rncp: zodOpenApi
          .array(
            zodOpenApi.object({
              code: zodOpenApi.string().openapi({
                example: "D1102",
              }),
              intitule: zodOpenApi.string().openapi({
                example: "Boulangerie - viennoiserie",
              }),
            })
          )
          .nullable()
          .openapi({
            description: buildOpenApiDescription("ROME issue de France Compétences.", [
              "- `null` lorsque le champs `identifiant.rncp` est `null`.",
            ]),
          }),
      })
      .openapi({
        description: "Répertoire Opérationnel des Métiers et des Emplois (ROME).",
      }),
  })
  .openapi({
    description: certificationDoc.domainesTypologie.fields.domainesField.description,
  });

const zCertifType = zodOpenApi
  .object({
    nature: zodOpenApi
      .object({
        cfd: zodOpenApi
          .object({
            code: zodOpenApi
              .string()
              .nullable()
              .openapi({
                examples: ["1", "2", "P"],
              }),
            libelle: zodOpenApi
              .string()
              .nullable()
              .openapi({
                examples: [
                  "DIPLOME NATIONAL / DIPLOME D'ETAT",
                  "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
                  "CLASSE PREPA",
                ],
              }),
          })
          .nullable()
          .openapi({
            description: buildOpenApiDescription(
              "Nature du diplôme issue de la base centrale des nomenclatures (BCN).",
              ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
            ),
          }),
      })
      .openapi({
        description: "Nature du diplôme.",
      }),
    gestionnaire_diplome: zodOpenApi
      .string()
      .nullable()
      .openapi({
        description: buildOpenApiDescription("Service responsable de la définition du diplôme.", [
          "- `null` lorsque le champs `identifiant.cfd` est `null`.",
        ]),
        example: "DGESCO A2-3",
      }),
    enregistrement_rncp: zTypeEnregistrement.nullable().openapi({
      description: buildOpenApiDescription(
        "Permet de savoir si la certification est enregistrée de droit ou sur demande au Repertoire National des Certifications Professionnelles (RNCP)",
        ["- `null` lorsque le champs `identifiant.rncp` est `null`."]
      ),
    }),
    voie_acces: zodOpenApi
      .object({
        rncp: zodOpenApi
          .object({
            apprentissage: zodOpenApi.boolean().openapi({
              description: "Certification accessible en contrat d’apprentissage.",
            }),
            experience: zodOpenApi.boolean().openapi({
              description: "Certification accessible par expérience.",
            }),
            candidature_individuelle: zodOpenApi.boolean().openapi({
              description: "Certification accessible par candidature individuelle.",
            }),
            contrat_professionnalisation: zodOpenApi.boolean().openapi({
              description: "Certification accessible en contrat de professionnalisation.",
            }),
            formation_continue: zodOpenApi.boolean().openapi({
              description: "Certification accessible après un parcours de formation continue.",
            }),
            formation_statut_eleve: zodOpenApi.boolean().openapi({
              description: "Certification accessible après un parcours de formation sous statut d’élève ou d’étudiant.",
            }),
          })
          .nullable()
          .openapi({
            description: buildOpenApiDescription("Voie d’accès à la certification issue de France Compétences.", [
              "- `null` lorsque le champs `identifiant.rncp` est `null`.",
            ]),
          }),
      })
      .openapi({
        description: "Voie d’accès à la certification.",
      }),
    certificateurs_rncp: zodOpenApi
      .array(
        zodOpenApi.object({
          siret: zodOpenApi.string().openapi({
            description: "Numéro SIRET du certificateur renseigné dans le RNCP.",
          }),
          nom: zodOpenApi.string().openapi({
            description: "Nom du certificateur renseigné dans le RNCP.",
          }),
        })
      )
      .nullable()
      .openapi({
        description: buildOpenApiDescription("Liste des certificateurs de la fiche RNCP.", [
          "- `null` lorsque le champs `identifiant.rncp` est `null`.",
        ]),
      }),
  })
  .openapi({
    description: certificationDoc.typeTypologie.fields.typeField.description,
  });

const zCertifBaseLegale = zodOpenApi
  .object({
    cfd: zodOpenApi
      .object({
        creation: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription("Date d'arrêté de création du diplôme.", [
            "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
            "- La date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
          ]),
          examples: ["2014-02-21T00:00:00.000+01:00", "2018-05-11T00:00:00.000+02:00"],
        }),
        abrogation: zLocalDate.nullable().openapi({
          description: buildOpenApiDescription("Date d'arrêté d'abrogation du diplôme.", [
            "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
            "- La date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
          ]),
          examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
        }),
      })
      .nullable()
      .openapi({
        description: buildOpenApiDescription(
          "Informations légales issue de la base centrale des nomenclatures (BCN) relatives au diplôme.",
          ["- `null` lorsque le champs `identifiant.cfd` est `null`."]
        ),
      }),
  })
  .openapi({
    description: certificationDoc.baseLegaleTopologie.fields.baseLegaleField.description,
  });

const zCertifConventionCollectives = zodOpenApi
  .object({
    rncp: zodOpenApi
      .array(
        zodOpenApi.object({
          numero: zodOpenApi.string().openapi({
            example: "3002",
          }),
          intitule: zodOpenApi.string().openapi({
            example: "Bâtiment (Employés, techniciens et agents de maîtrise, ingénieurs, assimilés et cadres)",
          }),
        })
      )
      .nullable()
      .openapi({
        description: buildOpenApiDescription("Liste des conventions collectives issue de France Compétences.", [
          "- `null` lorsque le champs `identifiant.rncp` est `null`.",
        ]),
      }),
  })
  .openapi({
    description: certificationDoc.conventionsCollectivesTopologie.fields.conventionsCollectivesField.description,
  });

export const zContinuite = zodOpenApi.object({
  cfd: zodOpenApi
    .array(
      zodOpenApi.object({
        ouverture: zCertifPeriodeValidite.shape.cfd.unwrap().shape.ouverture.nullable(),
        fermeture: zCertifPeriodeValidite.shape.cfd.unwrap().shape.fermeture.nullable(),
        code: zCertifIdentifiant.shape.cfd.unwrap(),
        courant: zodOpenApi.boolean().openapi({
          description: "Indique si le diplôme correspond au diplôme courant, i.e `identifiant.cfd` est égal au `code`.",
        }),
      })
    )
    .nullable()
    .openapi({
      description: buildOpenApiDescription(
        "Liste des diplômes assurant la continuité du diplôme. La liste inclut à la fois les diplômes remplacés et remplaçant. La liste est ordonnée par date d'ouverture du diplôme et inclut le diplôme courant.",
        [
          "- `null` lorsque le champs `identifiant.cfd` est `null`.",
          "- Pour distinguer les diplômes remplacés des diplômes remplaçant, il faut se référer aux dates d'ouverture et de fermeture des diplômes.",
        ]
      ),
    }),
  rncp: zodOpenApi
    .array(
      zodOpenApi.object({
        activation: zCertifPeriodeValidite.shape.rncp.unwrap().shape.activation.nullable(),
        fin_enregistrement: zCertifPeriodeValidite.shape.rncp.unwrap().shape.fin_enregistrement.nullable(),
        code: zCertifIdentifiant.shape.rncp.unwrap(),
        courant: zodOpenApi.boolean().openapi({
          description: "Indique si la fiche correspond à la fiche courante, i.e `identifiant.rncp` est égal au `code`.",
        }),
        actif: zCertifPeriodeValidite.shape.rncp.unwrap().shape.actif,
      })
    )
    .nullable()
    .openapi({
      description: buildOpenApiDescription(certificationDoc.continuiteTopologie.fields.continuiteField.description, [
        "- `null` lorsque le champs `identifiant.rncp` est `null`.",
        "- Pour distinguer les fiches remplacées des fiches remplaçant, il faut se référer aux dates d'activation et de fin d'enregistrement des fiches.",
      ]),
    }),
});

export const zCertification = z.object({
  _id: zObjectId,
  identifiant: zCertifIdentifiant,
  intitule: zCertifIntitule,
  base_legale: zCertifBaseLegale,
  blocs_competences: zCertifBlocsCompetences,
  convention_collectives: zCertifConventionCollectives,
  domaines: zCertifDomaines,
  periode_validite: zCertifPeriodeValidite,
  type: zCertifType,
  continuite: zContinuite,
  created_at: z.date(),
  updated_at: z.date(),
});

export const zPublicCertification = zCertification.omit({
  _id: true,
  created_at: true,
  updated_at: true,
});

export type ICertification = z.output<typeof zCertification>;
export type ICertificationInput = z.input<typeof zCertification>;

export const certificationsModelDescriptor = {
  zod: zCertification,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;
