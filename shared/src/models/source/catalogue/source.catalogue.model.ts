import { z } from "zod";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.catalogue" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ date: 1, "data.cle_ministere_educatif": 1 }, {}]];

const etablissementFormateurSchema = z.object({
  etablissement_formateur_siret: z.string(),
  etablissement_formateur_uai: z.string().nullable(),
});

const etablissementGestionnaireSchema = z.object({
  etablissement_gestionnaire_siret: z.string(),
  etablissement_gestionnaire_uai: z.string().nullable(),
});

export const zFormationCatalogue = z
  .object({
    cle_ministere_educatif: z.string(),
    cfd: z.string(),
    code_postal: z.string(),
    code_commune_insee: z.string(),
    onisep_url: z.string().nullable(),
    onisep_intitule: z.string().nullable(),
    onisep_libelle_poursuite: z.string().nullable(),
    onisep_lien_site_onisepfr: z.string().nullable(),
    onisep_discipline: z.string().nullable(),
    onisep_domaine_sousdomaine: z.string().nullable(),
    rncp_code: z.string().nullable(),
    capacite: z.string().nullable(),
    duree: z.string(),
    annee: z.string(),
    email: z.string().nullable(),
    lieu_formation_geo_coordonnees: z.string(),
    lieu_formation_geo_coordonnees_computed: z.string().nullable(),
    lieu_formation_adresse: z.string(),
    lieu_formation_siret: z.string().nullish(),
    tags: z.array(z.string()),
    bcn_mefs_10: z.array(
      z.object({
        mef10: z.string(),
        modalite: z.object({ duree: z.string(), annee: z.string() }),
      })
    ),
    entierement_a_distance: z.boolean(),
    contenu: z.string().nullable(),
    objectif: z.string().nullable(),
    date_debut: z.array(z.string()).nullable(),
    date_fin: z.array(z.string()).nullable(),
    num_tel: z.string().nullable().describe("Numéro de téléphone de contact"),
    distance: z.number().nullable(),
    catalogue_published: z.boolean(),
    published: z.boolean(),
  })
  .merge(etablissementFormateurSchema)
  .merge(etablissementGestionnaireSchema);

export const zSourceCatalogue = z.object({
  _id: zObjectId,
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
