import { z } from "zod/v4-mini";

import { zParisLocalDate } from "../../utils/date.primitives.js";
import { zCertification } from "../certification/certification.model.js";
import { zMef10 } from "../certification/certification.primitives.js";
import { zAdresse, zGeoJsonPoint } from "../geographie/geoJson.model.js";
import { zOrganisme } from "../organisme/organisme.model.js";
import { zSiret, zUai } from "../organisme/organismes.primitives.js";

export const zFormation = z.object({
  identifiant: z.object({
    cle_ministere_educatif: z.string(),
  }),

  statut: z.object({
    catalogue: z.enum(["publié", "supprimé", "archivé"]),
  }),

  formateur: z.object({
    organisme: z.nullable(zOrganisme),
    connu: z.boolean(),
  }),

  responsable: z.object({
    organisme: z.nullable(zOrganisme),
    connu: z.boolean(),
  }),

  certification: z.object({
    valeur: zCertification,
    connue: z.boolean(),
  }),

  lieu: z.object({
    adresse: zAdresse,

    geolocalisation: zGeoJsonPoint,

    precision: z.nullable(z.number()),

    siret: z.nullable(zSiret),
    uai: z.nullable(zUai),
  }),

  contact: z.object({
    email: z.nullable(z.string().check(z.email())),
    telephone: z.nullable(z.string()),
  }),

  onisep: z.object({
    url: z.nullable(z.string().check(z.url())),
    intitule: z.nullable(z.string()),
    libelle_poursuite: z.nullable(z.string()),
    lien_site_onisepfr: z.nullable(z.string()),
    discipline: z.nullable(z.string()),
    domaine_sousdomaine: z.nullable(z.string()),
  }),

  modalite: z.object({
    entierement_a_distance: z.boolean(),
    duree_indicative: z.number(),
    annee_cycle: z.nullable(z.int()),
    mef_10: z.nullable(zMef10),
  }),

  contenu_educatif: z.object({
    contenu: z.string(),
    objectif: z.string(),
  }),

  sessions: z.array(
    z.object({
      debut: zParisLocalDate,
      fin: zParisLocalDate,

      capacite: z.nullable(z.number()),
    })
  ),
});

export type IFormation = z.infer<typeof zFormation>;
