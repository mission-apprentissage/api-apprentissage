import type { Jsonify } from "type-fest";
import { z } from "zod";

import { zParisLocalDate } from "../../utils/date.primitives.js";
import {
  zCfd,
  zNiveauDiplomeEuropeen,
  zNsfCode,
  zRncp,
  zRncpBlocCompetenceCode,
  zRomeCode,
  zTypeEnregistrement,
} from "./certification.primitives.js";

const zCertifIdentifiant = z.object({
  cfd: zCfd.nullable(),
  rncp: zRncp.nullable(),
  rncp_anterieur_2019: z.boolean().nullable(),
});

const zCertifPeriodeValidite = z.object({
  debut: zParisLocalDate.nullable(),
  fin: zParisLocalDate.nullable(),
  cfd: z
    .object({
      ouverture: zParisLocalDate.nullable(),
      fermeture: zParisLocalDate.nullable(),
      premiere_session: z.number().int().nullable(),
      derniere_session: z.number().int().nullable(),
    })
    .nullable(),
  rncp: z
    .object({
      actif: z.boolean(),
      activation: zParisLocalDate.nullable(),
      debut_parcours: zParisLocalDate.nullable(),
      fin_enregistrement: zParisLocalDate.nullable(),
    })
    .nullable(),
});

const zCertifIntitule = z.object({
  cfd: z
    .object({
      long: z.string(),
      court: z.string(),
    })
    .nullable(),
  niveau: z.object({
    cfd: z
      .object({
        europeen: zNiveauDiplomeEuropeen.nullable(),
        formation_diplome: z.string(),
        interministeriel: z.string(),
        libelle: z.string().nullable(),
        sigle: z.string(),
      })
      .nullable(),
    rncp: z
      .object({
        europeen: zNiveauDiplomeEuropeen.nullable(),
      })
      .nullable(),
  }),
  rncp: z.string().nullable(),
});

const zCertifBlocsCompetences = z.object({
  rncp: z
    .array(
      z.object({
        code: zRncpBlocCompetenceCode,
        intitule: z.string().nullable(),
      })
    )
    .nullable(),
});

const zCertifDomaines = z.object({
  formacodes: z.object({
    rncp: z
      .array(
        z.object({
          code: z.string(),
          intitule: z.string(),
        })
      )
      .nullable(),
  }),
  nsf: z.object({
    cfd: z
      .object({
        code: z.string(),
        intitule: z.string().nullable(),
      })
      .nullable(),
    rncp: z
      .array(
        z.object({
          code: zNsfCode,
          intitule: z.string().nullable(),
        })
      )
      .nullable(),
  }),
  rome: z.object({
    rncp: z
      .array(
        z.object({
          code: z.union([zRomeCode, z.string().regex(/^[A-Z]\d{2}$/)]),
          intitule: z.string(),
        })
      )
      .nullable(),
  }),
});

const zCertifType = z.object({
  nature: z.object({
    cfd: z
      .object({
        code: z.string().nullable(),
        libelle: z.string().nullable(),
      })
      .nullable(),
  }),
  gestionnaire_diplome: z.string().nullable(),
  enregistrement_rncp: zTypeEnregistrement.nullable(),
  voie_acces: z.object({
    rncp: z
      .object({
        apprentissage: z.boolean(),
        experience: z.boolean(),
        candidature_individuelle: z.boolean(),
        contrat_professionnalisation: z.boolean(),
        formation_continue: z.boolean(),
        formation_statut_eleve: z.boolean(),
      })
      .nullable(),
  }),
  certificateurs_rncp: z
    .array(
      z.object({
        siret: z.string(),
        nom: z.string(),
      })
    )
    .nullable(),
});

const zCertifBaseLegale = z.object({
  cfd: z
    .object({
      creation: zParisLocalDate.nullable(),
      abrogation: zParisLocalDate.nullable(),
    })
    .nullable(),
});

const zCertifConventionCollectives = z.object({
  rncp: z
    .array(
      z.object({
        numero: z.string(),
        intitule: z.string(),
      })
    )
    .nullable(),
});

const zContinuite = z.object({
  cfd: z
    .array(
      z.object({
        ouverture: zCertifPeriodeValidite.shape.cfd.unwrap().shape.ouverture.nullable(),
        fermeture: zCertifPeriodeValidite.shape.cfd.unwrap().shape.fermeture.nullable(),
        code: zCertifIdentifiant.shape.cfd.unwrap(),
        courant: z.boolean(),
      })
    )
    .nullable(),
  rncp: z
    .array(
      z.object({
        activation: zCertifPeriodeValidite.shape.rncp.unwrap().shape.activation.nullable(),
        fin_enregistrement: zCertifPeriodeValidite.shape.rncp.unwrap().shape.fin_enregistrement.nullable(),
        code: zCertifIdentifiant.shape.rncp.unwrap(),
        courant: z.boolean(),
        actif: zCertifPeriodeValidite.shape.rncp.unwrap().shape.actif,
      })
    )
    .nullable(),
});

export const zCertification = z.object({
  identifiant: zCertifIdentifiant,
  intitule: zCertifIntitule,
  base_legale: zCertifBaseLegale,
  blocs_competences: zCertifBlocsCompetences,
  convention_collectives: zCertifConventionCollectives,
  domaines: zCertifDomaines,
  periode_validite: zCertifPeriodeValidite,
  type: zCertifType,
  continuite: zContinuite,
});

export type ICertification = z.output<typeof zCertification>;
export type ICertificationJson = Jsonify<ICertification>;
export type ICertificationInput = z.input<typeof zCertification>;
