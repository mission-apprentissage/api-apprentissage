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
  [{ "identifiant.cfd": 1, "identifiant.rncp": 1 }, { unique: true }],
  [{ "identifiant.rncp": 1, "identifiant.cfd": 1 }, { unique: true }],
];

const zCertifBaseLegale = zodOpenApi.object({
  cfd: zodOpenApi
    .object({
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
    })
    .nullable(),
});

const zCertifBlocsCompetences = zodOpenApi.object({
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
      description: "Liste du (ou des) code (s) et intitulé(s) des blocs de compétences validées par la certification",
    }),
});

const zCertifConventionCollectives = zodOpenApi.object({
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
      description: "Numéro(s) et intitulé(s) de la convention collective associée(s) à la fiche RNCP",
    }),
});

const zCertifDomaines = zodOpenApi.object({
  formacodes: zodOpenApi.object({
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
        description: "Code(s) et intitulé(s) du (ou des) code Formacode(s) auquel(s) appartien(ne)t la certification",
      }),
  }),
  nsf: zodOpenApi.object({
    cfd: zodOpenApi
      .object({
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
      .nullable()
      .openapi({
        description:
          "Code(s) et intitulé(s) du domaine de formation à laquelle appartient la certification, il suit la Nomenclature des Spécialités de Formation (NSF) de l’INSEE.\n\nLe code NSF est déduis du code formation diplôme (CFD), il n'inclus donc pas la lettre de spécialité et le tableau ne contient qu'un seul élément.",
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
        description:
          "Code(s) et intitulé(s) du domaine de formation à laquelle appartient la certification, il suit la Nomenclature des Spécialités de Formation (NSF) de l’INSEE.",
      }),
  }),
  rome: zodOpenApi.object({
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
        description:
          "Code(s) et intitulé(s) de la (ou des) fiche(s) métier du Répertoire Opérationnel des Métiers et de l’Emploi (ROME) associé(s) à la certification.",
      }),
  }),
});

const zCertifIdentifiant = zodOpenApi
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
    rncp_anterieur_2019: zodOpenApi.boolean().nullable(),
  })
  .openapi({
    description:
      "**Une certification correspond à un couple CFD-RNCP sur une période donnée.**\n\nLe couple CFD-RNCP est unique, mais lorsque la correspondance n'est pas connue, l'un des deux peut être `null`.",
  });

const zCertifIntitule = zodOpenApi.object({
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
    }),
  niveau: zodOpenApi.object({
    cfd: zodOpenApi
      .object({
        europeen: zNiveauDiplomeEuropeen.nullable().openapi({
          description:
            "**Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.**",
          examples: ["3", "5"],
        }),
        formation_diplome: zodOpenApi.string().openapi({
          description: "**Code à 3 caractères qui renseigne sur le niveau du diplôme.**",
          examples: ["500", "370"],
        }),
        interministeriel: zodOpenApi.string().openapi({
          description: "**Code interministériel du niveau de la formation.**",
          examples: ["3", "6"],
        }),
        libelle: zodOpenApi
          .string()
          .nullable()
          .openapi({
            description: "**Libellé complet du niveau de la formation.**",
            examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
          }),
        sigle: zodOpenApi.string().openapi({
          description: "**Libellé abrégé du niveau de la formation.**",
          examples: ["CAP", "DUT", "BTS", "CPGE"],
        }),
      })
      .nullable()
      .openapi({
        description:
          "**Regroupement des données relative au niveau de la certification provenant de la base centrale des nomenclatures (BCN).**",
      }),
    rncp: zodOpenApi
      .object({
        europeen: zNiveauDiplomeEuropeen.nullable().openapi({
          description:
            "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
          example: "3",
        }),
      })
      .nullable(),
  }),
  rncp: zodOpenApi
    .string()
    .openapi({
      example: "Boulanger",
    })
    .nullable(),
});

const zCertifPeriodeValidite = zodOpenApi
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
        premiere_session: z.number().int().nullable().openapi({
          description: "**Année de sortie des premiers diplômés.**",
          example: 2022,
        }),
        derniere_session: z.number().int().nullable().openapi({
          description: "**Année de sortie des derniers diplômés.**",
          example: 2025,
        }),
      })
      .nullable(),
    rncp: zodOpenApi
      .object({
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
        debut_parcours: zLocalDate.nullable().openapi({
          description:
            "**Date de début des parcours certifiants.**Anciennement appelé 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.\n\nLa date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.",
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        }),
      })
      .nullable(),
  })
  .openapi({
    description:
      "Un couple CFD-RNCP a une période de validité qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
  });

const zCertifType = zodOpenApi.object({
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
      description: "Liste des certificateurs de la certification.",
    }),
  enregistrement_rncp: zTypeEnregistrement.nullable(),
  gestionnaire_diplome: zodOpenApi.string().nullable().openapi({
    description: "**Service responsable de la définition du diplôme.**",
    example: "DGESCO A2-3",
  }),
  nature: zodOpenApi.object({
    cfd: zodOpenApi
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
      .nullable()
      .openapi({
        description: "**Nature du diplôme.**",
      }),
  }),
  voie_acces: zodOpenApi.object({
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
      .nullable(),
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
