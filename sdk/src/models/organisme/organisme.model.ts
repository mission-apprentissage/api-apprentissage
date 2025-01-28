import { z } from "zod";

import { zParisLocalDate, zParisLocalDateNullable } from "../../utils/date.primitives.js";
import { zAdresse } from "../geographie/geoJson.model.js";
import { zSiret, zUai } from "./organismes.primitives.js";

export const zOrganisme = z
  .object({
    identifiant: z.object({
      uai: zUai.nullable(),
      siret: zSiret,
    }),

    etablissement: z.object({
      siret: zSiret,
      ouvert: z.boolean(),

      enseigne: z.string().nullable(),

      adresse: zAdresse.nullable(),

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

    contacts: z.array(
      z.object({
        email: z.string().email(),
        sources: z.array(z.string()),
        confirmation_referentiel: z.boolean(),
      })
    ),
  })
  .openapi("Organisme");

export type IOrganisme = z.output<typeof zOrganisme>;
