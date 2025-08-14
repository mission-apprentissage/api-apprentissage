import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectIdMini } from "../../common.js";

const collectionName = "source.catalogue" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ date: 1, "data.cle_ministere_educatif": 1 }, {}]];

export const zFormationCatalogue = z.object({
  cle_ministere_educatif: z.string(),
  cfd: z.string(),
  code_postal: z.string(),
  code_commune_insee: z.string(),
  onisep_url: z.nullable(z.string()),
  onisep_intitule: z.nullable(z.string()),
  onisep_libelle_poursuite: z.nullable(z.string()),
  onisep_lien_site_onisepfr: z.nullable(z.string()),
  onisep_discipline: z.nullable(z.string()),
  onisep_domaine_sousdomaine: z.nullable(z.string()),
  rncp_code: z.nullable(z.string()),
  capacite: z.nullable(z.string()),
  duree: z.string(),
  annee: z.string(),
  email: z.nullable(z.string()),
  lieu_formation_geo_coordonnees: z.string(),
  lieu_formation_geo_coordonnees_computed: z.nullable(z.string()),
  lieu_formation_adresse: z.string(),
  etablissement_lieu_formation_siret: z.nullish(z.string()),
  etablissement_lieu_formation_uai: z.nullish(z.string()),
  tags: z.array(z.string()),
  bcn_mefs_10: z.array(
    z.object({
      mef10: z.string(),
      modalite: z.object({ duree: z.string(), annee: z.string() }),
    })
  ),
  entierement_a_distance: z.boolean(),
  contenu: z.nullable(z.string()),
  objectif: z.nullable(z.string()),
  date_debut: z.nullable(z.array(z.string())),
  date_fin: z.nullable(z.array(z.string())),
  num_tel: z.nullable(z.string()),
  distance: z.nullable(z.number()),
  catalogue_published: z.boolean(),
  published: z.boolean(),
  etablissement_formateur_siret: z.string(),
  etablissement_formateur_uai: z.nullable(z.string()),
  etablissement_gestionnaire_siret: z.string(),
  etablissement_gestionnaire_uai: z.nullable(z.string()),
});

export const zSourceCatalogue = z.object({
  _id: zObjectIdMini,
  date: z.date(),
  data: zFormationCatalogue,
});

export type IFormationCatalogue = z.output<typeof zFormationCatalogue>;
export type ISourceCatalogue = z.output<typeof zSourceCatalogue>;

export default {
  zod: zSourceCatalogue,
  indexes,
  collectionName,
};
