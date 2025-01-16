import { z } from "zod";

import { zParisLocalDate } from "../../utils/date.primitives.js";
import { zCertification } from "../certification/certification.model.js";
import { zMef10 } from "../certification/certification.primitives.js";
import { zAdresse, zGeoJsonPoint } from "../geographie/geoJson.model.js";
import { zOrganisme } from "../organisme/organisme.model.js";
import { zSiret } from "../organisme/organismes.primitives.js";

export const zFormation = z
  .object({
    identifiant: z.object({
      cle_ministere_educatif: z.string(),
    }),

    statut: z.object({
      catalogue: z.enum(["publié", "supprimé", "archivé"]),
    }),

    formateur: z.object({
      organisme: zOrganisme.nullable(),
      connu: z.boolean(),
    }),

    responsable: z.object({
      organisme: zOrganisme.nullable(),
      connu: z.boolean(),
    }),

    certification: z.object({
      valeur: zCertification,
      connue: z.boolean(),
    }),

    lieu: z.object({
      adresse: zAdresse,

      geolocalisation: zGeoJsonPoint,

      precision: z.number().nullable(),

      siret: zSiret.nullable(),
    }),

    contact: z.object({
      email: z.string().email().nullable(),
      telephone: z.string().nullable(),
    }),

    onisep: z.object({
      url: z.string().url().nullable(),
      intitule: z.string().nullable(),
      libelle_poursuite: z.string().nullable(),
      lien_site_onisepfr: z.string().nullable(),
      discipline: z.string().nullable(),
      domaine_sousdomaine: z.string().nullable(),
    }),

    modalite: z.object({
      entierement_a_distance: z.boolean(),
      duree_indicative: z.number(),
      annee_cycle: z.number().int().nullable(),
      mef_10: zMef10.nullable(),
    }),

    contenu_educatif: z.object({
      contenu: z.string(),
      objectif: z.string(),
    }),

    sessions: z.array(
      z.object({
        debut: zParisLocalDate,
        fin: zParisLocalDate,

        capacite: z.number().nullable(),
      })
    ),
  })
  .openapi("Formation");

export type IFormation = z.infer<typeof zFormation>;
