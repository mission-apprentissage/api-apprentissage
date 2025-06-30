import type { Jsonify } from "type-fest";
import { z } from "zod/v4-mini";
import { zParisLocalDateNullable } from "../../utils/date.primitives.js";
import {
  zCfd,
  zNiveauDiplomeEuropeen,
  zNsfCode,
  zRncp,
  zRncpBlocCompetenceCode,
  zRomeCodeFlex,
  zTypeEnregistrement,
} from "./certification.primitives.js";

const zCertifIdentifiant = z.object({
  cfd: z.nullable(zCfd),
  rncp: z.nullable(zRncp),
  rncp_anterieur_2019: z.nullable(z.boolean()),
});

const zCertifPeriodeValidite = z.object({
  debut: zParisLocalDateNullable,
  fin: zParisLocalDateNullable,
  cfd: z.nullable(
    z.object({
      ouverture: zParisLocalDateNullable,
      fermeture: zParisLocalDateNullable,
      premiere_session: z.nullable(z.int()),
      derniere_session: z.nullable(z.int()),
    })
  ),
  rncp: z.nullable(
    z.object({
      actif: z.boolean(),
      activation: zParisLocalDateNullable,
      debut_parcours: zParisLocalDateNullable,
      fin_enregistrement: zParisLocalDateNullable,
    })
  ),
});

const zCertifIntitule = z.object({
  cfd: z.nullable(
    z.object({
      long: z.string(),
      court: z.string(),
    })
  ),
  niveau: z.object({
    cfd: z.nullable(
      z.object({
        europeen: z.nullable(zNiveauDiplomeEuropeen),
        formation_diplome: z.string(),
        interministeriel: z.string(),
        libelle: z.nullable(z.string()),
        sigle: z.string(),
      })
    ),
    rncp: z.nullable(
      z.object({
        europeen: z.nullable(zNiveauDiplomeEuropeen),
      })
    ),
  }),
  rncp: z.nullable(z.string()),
});

const zCertifBlocsCompetences = z.object({
  rncp: z.nullable(
    z.array(
      z.object({
        code: zRncpBlocCompetenceCode,
        intitule: z.nullable(z.string()),
      })
    )
  ),
});

const zCertifDomaines = z.object({
  formacodes: z.object({
    rncp: z.nullable(
      z.array(
        z.object({
          code: z.string(),
          intitule: z.string(),
        })
      )
    ),
  }),
  nsf: z.object({
    cfd: z.nullable(
      z.object({
        code: z.string(),
        intitule: z.nullable(z.string()),
      })
    ),
    rncp: z.nullable(
      z.array(
        z.object({
          code: zNsfCode,
          intitule: z.nullable(z.string()),
        })
      )
    ),
  }),
  rome: z.object({
    rncp: z.nullable(
      z.array(
        z.object({
          code: zRomeCodeFlex,
          intitule: z.string(),
        })
      )
    ),
  }),
});

const zCertifType = z.object({
  nature: z.object({
    cfd: z.nullable(
      z.object({
        code: z.nullable(z.string()),
        libelle: z.nullable(z.string()),
      })
    ),
  }),
  gestionnaire_diplome: z.nullable(z.string()),
  enregistrement_rncp: z.nullable(zTypeEnregistrement),
  voie_acces: z.object({
    rncp: z.nullable(
      z.object({
        apprentissage: z.boolean(),
        experience: z.boolean(),
        candidature_individuelle: z.boolean(),
        contrat_professionnalisation: z.boolean(),
        formation_continue: z.boolean(),
        formation_statut_eleve: z.boolean(),
      })
    ),
  }),
  certificateurs_rncp: z.nullable(
    z.array(
      z.object({
        siret: z.string(),
        nom: z.string(),
      })
    )
  ),
});

const zCertifBaseLegale = z.object({
  cfd: z.nullable(
    z.object({
      creation: zParisLocalDateNullable,
      abrogation: zParisLocalDateNullable,
    })
  ),
});

const zCertifConventionCollectives = z.object({
  rncp: z.nullable(
    z.array(
      z.object({
        numero: z.string(),
        intitule: z.string(),
      })
    )
  ),
});

const zContinuite = z.object({
  cfd: z.nullable(
    z.array(
      z.object({
        ouverture: zParisLocalDateNullable,
        fermeture: zParisLocalDateNullable,
        code: zCertifIdentifiant.shape.cfd.def.innerType,
        courant: z.boolean(),
      })
    )
  ),
  rncp: z.nullable(
    z.array(
      z.object({
        activation: zParisLocalDateNullable,
        fin_enregistrement: zParisLocalDateNullable,
        code: zCertifIdentifiant.shape.rncp.def.innerType,
        courant: z.boolean(),
        actif: zCertifPeriodeValidite.shape.rncp.def.innerType.shape.actif,
      })
    )
  ),
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
