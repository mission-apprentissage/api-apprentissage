import { z } from "zod";

import {
  zCfd,
  zNiveauDiplomeEuropeen,
  zNsfCode,
  zRncp,
  zRncpBlocCompetenceCode,
  zTypeEnregistrement,
} from "../zod/certifications.primitives";
import { zLocalDate } from "../zod/date.primitives";
import { zodOpenApi } from "../zod/zodWithOpenApi";
import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "certifications" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ "code.cfd": 1, "code.rncp": 1 }, { unique: true }],
  [{ "code.rncp": 1, "code.cfd": 1 }, {}],
];

const zCertificationRncp = zodOpenApi.object({
  actif: zodOpenApi.boolean().openapi({
    description:
      "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
  }),
  activation: zLocalDate.nullable().openapi({
    description:
      "**Date à laquelle la fiche RNCP est passée au statut `actif`.**\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.\n\nLa couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
    examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
  }),
  fin_enregistrement: zLocalDate.nullable().openapi({
    description:
      "**Date de fin d’enregistrement d’une fiche au RNCP.**\n\nLorsque la date d'échéance d'enregistrement de la certification est dépassée. La fiche passe automatiquement au statut Inactive.\n\nPour les enregistrement de droit, cette date est renseignée par le certificateur. Pour les enregistrements sur demande, elle est déterminée par commission au moment de la décision d’enregistrement.\n\nFrance Compétence ne fournie pas l'information du fuseau horaire, nous interprétons arbitrairement sur le fuseau horaire 'Europe/Paris'.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
  }),
  debut_parcours: zLocalDate.nullable(),
  intitule: z.string(),
  blocs: zodOpenApi.array(
    zodOpenApi.object({
      code: zRncpBlocCompetenceCode,
      intitule: zodOpenApi.string().nullable(),
    })
  ),
  rome: zodOpenApi.array(
    zodOpenApi.object({
      code: zodOpenApi.string(),
      intitule: zodOpenApi.string(),
    })
  ),
  formacodes: zodOpenApi.array(
    zodOpenApi.object({
      code: zodOpenApi.string(),
      intitule: zodOpenApi.string(),
    })
  ),
  convention_collectives: zodOpenApi.array(
    zodOpenApi.object({
      numero: zodOpenApi.string(),
      intitule: zodOpenApi.string(),
    })
  ),
  niveau: zodOpenApi.object({
    europeen: zNiveauDiplomeEuropeen.nullable(),
    interministeriel: zodOpenApi.string().nullable(),
  }),
  nsf: zodOpenApi.array(
    z.object({
      code: zNsfCode,
      intitule: zodOpenApi.string().nullable(),
    })
  ),
  enregistrement: zTypeEnregistrement,
  voie_acces: zodOpenApi.object({
    apprentissage: zodOpenApi.boolean(),
    experience: zodOpenApi.boolean(),
    candidature_individuelle: zodOpenApi.boolean(),
    contrat_professionnalisation: zodOpenApi.boolean(),
    formation_continue: zodOpenApi.boolean(),
    formation_statut_eleve: zodOpenApi.boolean(),
  }),
  certificateurs: zodOpenApi.array(
    zodOpenApi.object({
      siret: zodOpenApi.string(),
      nom: zodOpenApi.string(),
    })
  ),
});

export const zCertification = z.object({
  _id: zObjectId,
  code: zodOpenApi
    .object({
      cfd: zCfd.nullable().openapi({
        description:
          "**Code Formation Diplôme (CFD) de la certification.**\n\nLorsque celui-ci est `null`, alors le champs `certification.cfd` est alors `null`",
        example: "50022137",
      }),
      rncp: zRncp.nullable().openapi({
        description:
          "**Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.**\n\nLorsque celui-ci est `null`, alors le champs `certification.rncp` est alors `null`",
        example: "RNCP37537",
      }),
    })
    .openapi({
      description:
        "**Une certification correspond à un couple CFD-RNCP sur une période donnée.**\n\nLe couple CFD-RNCP est unique, mais lorsque la correspondance n'est pas connue, l'un des deux peut être `null`.",
    }),
  periode_validite: zodOpenApi
    .object({
      debut: zLocalDate.nullable().openapi({
        description:
          "**Date de début de validité de la certification.**\n\nCette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP. La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.",
        examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
      }),
      fin: zLocalDate.nullable().openapi({
        description:
          "**Date de fin de validité de la certification.**\n\nCette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.",
        examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
      }),
    })
    .openapi({
      description:
        "Un couple CFD-RNCP a une période de validité qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
    }),
  cfd: zodOpenApi
    .object({
      ouverture: zLocalDate.nullable().openapi({
        description:
          "**Date d'ouverture du diplôme.**\n\nLa base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
        examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
      }),
      fermeture: zLocalDate.nullable().openapi({
        description:
          "**Date de fermeture du diplôme.**\n\nLa base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
        examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
      }),
      creation: zLocalDate.nullable().openapi({
        description:
          "**Date d'arrêté de création du diplôme.**\n\nLa base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
        examples: ["2014-02-21T00:00:00.000+01:00", "2018-05-11T00:00:00.000+02:00"],
      }),
      abrogation: zLocalDate.nullable().openapi({
        description:
          "**Date d'arrêté d'abrogation du diplôme.**\n\nLa base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire 'Europe/Paris'.",
        examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
      }),
      intitule: zodOpenApi
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
        .openapi({
          description:
            "**Intitulé du diplôme.**\n\nLa base centrale des nomenclatures (BCN) fournie un intitulé long et court du diplôme.",
        }),
      nature: zodOpenApi
        .object({
          code: zodOpenApi
            .string()
            .nullable()
            .openapi({
              description: "**Code de la nature du diplôme.**",
              examples: ["1", "2", "P"],
            }),
          libelle: zodOpenApi
            .string()
            .nullable()
            .openapi({
              description: "**Intitulé de la nature du diplôme.**",
              examples: [
                "DIPLOME NATIONAL / DIPLOME D'ETAT",
                "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
                "CLASSE PREPA",
              ],
            }),
        })
        .openapi({
          description: "**Nature du diplôme.**",
        }),
      gestionnaire: zodOpenApi.string().nullable().openapi({
        description: "**Service responsable de la définition du diplôme.**",
        example: "DGESCO A2-3",
      }),
      session: zodOpenApi
        .object({
          premiere: z.number().int().nullable().openapi({
            description: "**Année de sortie des premiers diplômés.**",
            example: 2022,
          }),
          fin: z.number().int().nullable().openapi({
            description: "**Année de sortie des derniers diplômés.**",
            example: 2025,
          }),
        })
        .openapi({
          description: "**Première et derniere année de sortie des diplômés.**",
        }),
      niveau: zodOpenApi
        .object({
          sigle: zodOpenApi.string().openapi({
            description: "**Libellé abrégé du niveau de la formation.**",
            examples: ["CAP", "DUT", "BTS", "CPGE"],
          }),
          europeen: zNiveauDiplomeEuropeen.nullable().openapi({
            description:
              "**Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.**",
            examples: ["3", "5"],
          }),
          formation_diplome: zodOpenApi.string().openapi({
            description: "**Code à 3 caractères qui renseigne sur le niveau du diplôme.**",
            examples: ["500", "370"],
          }),
          intitule: zodOpenApi
            .string()
            .nullable()
            .openapi({
              description: "**Libellé complet du niveau de la formation.**",
              examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
            }),
          interministeriel: zodOpenApi.string().openapi({
            description: "**Code interministériel du niveau de la formation.**",
            examples: ["3", "6"],
          }),
        })
        .openapi({
          description:
            "**Regroupement des données relative au niveau de la certification provenant de la base centrale des nomenclatures (BCN).**",
        }),
      nsf: zodOpenApi
        .array(
          z.object({
            code: zodOpenApi.string().openapi({
              description: "**Code NSF de la certification.**",
              examples: ["221", "310"],
            }),
            intitule: zodOpenApi
              .string()
              .nullable()
              .openapi({
                description: "**Intitulé du domaine de formation de la certification.**",
                examples: ["AGRO-ALIMENTAIRE, ALIMENTATION, CUISINE", "SPECIALIT.PLURIV.DES ECHANGES & GESTION"],
              }),
          })
        )
        .openapi({
          description:
            "Code(s) et intitulé(s) du domaine de formation à laquelle appartient la certification, il suit la Nomenclature des Spécialités de Formation (NSF) de l’INSEE.\n\nLe code NSF est déduis du code formation diplôme (CFD), il n'inclus donc pas la lettre de spécialité et le tableau ne contient qu'un seul élément.",
        }),
    })
    .nullable()
    .openapi({
      description:
        "**Regroupement des données relative au Code Formation Diplôme (CFD) de la certification provenant de la base centrale des nomenclatures (BCN).**\n\nLorsque `certification.code.cfd` est `null`, alors le champs `certification.cfd` est alors `null`",
    }),
  rncp: zCertificationRncp.nullable().openapi({
    description:
      "**Regroupement des données relative au Répertoire National des Certifications Professionnelles (RNCP) de la certification provenant de France Compétence.**\n\nLorsque `certification.code.rncp` est `null`, alors le champs `certification.rncp` est alors `null`.",
  }),
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
export type ICertificationRncpInput = z.input<typeof zCertificationRncp>;

export const certificationsModelDescriptor = {
  zod: zCertification,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;
