import { z } from "zod";

import { zParisLocalDate, zParisLocalDateNullable } from "../../internal.js";
import { zSiret, zUai } from "./organismes.primitives.js";

export const zOrganisme = z.object({
  identifiant: z.object({
    uai: zUai.nullable(),
    siret: zSiret,
  }),

  etablissement: z.object({
    siret: zSiret,
    ouvert: z.boolean(),

    enseigne: z.string().nullable(),

    adresse: z
      .object({
        label: z.string().nullable(),
        code_postal: z.string().nullable(),
        commune: z.object({
          nom: z.string(),
          code_insee: z.string(),
        }),
        departement: z.object({
          nom: z.string(),
          code_insee: z.string(),
        }),
        region: z.object({
          code_insee: z.string(),
          nom: z.string(),
        }),
        academie: z.object({
          id: z.string(),
          code: z.string(),
          nom: z.string(),
        }),
      })
      .nullable(),

    creation: zParisLocalDate,
    fermeture: zParisLocalDateNullable,
  }),

  unite_legale: z.object({
    siren: z.string(),

    actif: z.boolean(),
    raison_sociale: z.string(),

    creation: zParisLocalDate,
    cessation: zParisLocalDateNullable,
  }),

  renseignements_specifiques: z.object({
    qualiopi: z.boolean(),
    numero_activite: z.string().nullable(),
  }),

  statut: z.object({
    referentiel: z.enum(["présent", "supprimé"]),
  }),
});

export type IOrganisme = z.output<typeof zOrganisme>;
