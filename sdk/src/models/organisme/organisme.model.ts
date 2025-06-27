import { z } from "zod/v4-mini";

import { zParisLocalDate, zParisLocalDateNullable } from "../../utils/date.primitives.js";
import { zAdresse, zGeoJsonPoint } from "../geographie/geoJson.model.js";
import { zTransformNullIfEmptyString } from "../primitives/primitives.model.js";
import { zSiret, zUai } from "./organismes.primitives.js";

export const zOrganisme = z.object({
  identifiant: z.object({
    uai: z.nullable(zUai),
    siret: zSiret,
  }),

  etablissement: z.object({
    siret: zSiret,
    ouvert: z.boolean(),

    enseigne: z.pipe(z.nullable(z.string()), zTransformNullIfEmptyString),

    adresse: z.nullable(zAdresse),
    geopoint: z.nullable(zGeoJsonPoint),

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
    numero_activite: z.nullable(z.string()),
  }),

  statut: z.object({
    referentiel: z.enum(["présent", "supprimé"]),
  }),

  contacts: z.array(
    z.object({
      email: z.string().check(z.email()),
      sources: z.array(z.string()),
      confirmation_referentiel: z.boolean(),
    })
  ),
});

export type IOrganisme = z.output<typeof zOrganisme>;
