import { z } from "zod";

import {
  zCfd,
  zCfdNatureCode,
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
        code: zCfdNatureCode.nullable(),
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
          code: zNsfCode,
          intitule: zodOpenApi.string().nullable(),
        })
      ),
    })
    .nullable(),
  rncp: zodOpenApi
    .object({
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
    })
    .nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ICertification = z.output<typeof zCertification>;
export type ICertificationInput = z.input<typeof zCertification>;

export const certificationsModelDescriptor = {
  zod: zCertification,
  indexes,
  collectionName,
} as const satisfies IModelDescriptor;
