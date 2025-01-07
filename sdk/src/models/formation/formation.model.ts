import { z } from "zod";

import { zParisLocalDate } from "../../internal.js";
import { zCertification } from "../certification/certification.model.js";
import { zGeoJsonPoint } from "../geographie/geoJson.model.js";
import { zMef10, zSiret } from "../internal.js";
import { zOrganisme } from "../organisme/organisme.model.js";

export const zFormation = z.object({
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
    adresse: z.object({
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
    }),

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
});

export type IFormation = z.infer<typeof zFormation>;
