import { z } from "zod";

import {
  zCfd,
  zNiveauDiplomeEuropeen,
  zNsfCode,
  zRncp,
  zRncpBlocCompetenceCode,
  zTypeEnregistrement,
} from "../zod/certifications.primitives";
import { zodOpenApi } from "../zod/zodWithOpenApi";
import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "certifications" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ "code.cfd": 1, "code.rncp": 1 }, { unique: true }],
  [{ "code.rncp": 1, "code.cfd": 1 }, {}],
];

const zCertificationRncp = zodOpenApi.object({
  actif: zodOpenApi.boolean(),
  activation: z.date().nullable(),
  fin_enregistrement: z.date().nullable(),
  debut_parcours: z.date().nullable(),
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
  code: zodOpenApi.object({
    cfd: zCfd.nullable(),
    rncp: zRncp.nullable(),
  }),
  periode_validite: zodOpenApi.object({
    debut: z.date().nullable(),
    fin: z.date().nullable(),
  }),
  cfd: zodOpenApi
    .object({
      ouverture: z.date().nullable(),
      fermeture: z.date().nullable(),
      creation: z.date().nullable(),
      abrogation: z.date().nullable(),
      intitule: zodOpenApi.object({
        long: zodOpenApi.string(),
        court: zodOpenApi.string(),
      }),
      nature: zodOpenApi.object({
        code: zodOpenApi.string().nullable(),
        libelle: zodOpenApi.string().nullable(),
      }),
      gestionnaire: zodOpenApi.string().nullable(),
      session: zodOpenApi.object({
        premiere: z.number().int().nullable(),
        fin: z.number().int().nullable(),
      }),
      niveau: zodOpenApi.object({
        sigle: zodOpenApi.string(),
        europeen: zNiveauDiplomeEuropeen.nullable(),
        formation_diplome: zodOpenApi.string(),
        intitule: zodOpenApi.string().nullable(),
        interministeriel: zodOpenApi.string(),
      }),
      nsf: zodOpenApi.array(
        z.object({
          code: zodOpenApi.string(),
          intitule: zodOpenApi.string().nullable(),
        })
      ),
    })
    .nullable(),
  rncp: zCertificationRncp.nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICertification = z.output<typeof zCertification>;
export type ICertificationInput = z.input<typeof zCertification>;
export type ICertificationRncpInput = z.input<typeof zCertificationRncp>;

export const certificationsModelDescriptor = {
  zod: zCertification,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;
