import { z } from "zod";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.catalogue" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ date: 1, "data.cle_ministere_educatif": 1 }, {}]];

const etablissementFormateurSchema = z
  .object({
    etablissement_formateur_id: z.string(),
    etablissement_formateur_siret: z.string(),
    etablissement_formateur_enseigne: z.string().nullable(),
    etablissement_formateur_uai: z.string().nullable(),
    etablissement_formateur_adresse: z.string().nullable(),
    etablissement_formateur_code_postal: z.string().nullable(),
    etablissement_formateur_code_commune_insee: z.string().nullable(),
    etablissement_formateur_localite: z.string().nullable(),
    etablissement_formateur_complement_adresse: z.string().nullable(),
    etablissement_formateur_cedex: z.string().nullable(),
    etablissement_formateur_entreprise_raison_sociale: z.string(),
    geo_coordonnees_etablissement_formateur: z.string().nullable(),
    etablissement_formateur_region: z.string().nullable(),
    etablissement_formateur_num_departement: z.string().nullable(),
    etablissement_formateur_nom_departement: z.string().nullable(),
    etablissement_formateur_nom_academie: z.string().nullable(),
    etablissement_formateur_num_academie: z.string().nullable(),
    etablissement_formateur_siren: z.string(),
    etablissement_formateur_courriel: z.string().nullable(),
    etablissement_formateur_published: z.boolean(), //
    etablissement_formateur_date_creation: z.string(),
  })
  .strict();

const etablissementGestionnaireSchema = z
  .object({
    etablissement_gestionnaire_id: z.string(),
    etablissement_gestionnaire_siret: z.string(),
    etablissement_gestionnaire_enseigne: z.string().nullable(),
    etablissement_gestionnaire_uai: z.string().nullable(),
    etablissement_gestionnaire_adresse: z.string().nullable(),
    etablissement_gestionnaire_code_postal: z.string().nullable(),
    etablissement_gestionnaire_code_commune_insee: z.string().nullable(),
    etablissement_gestionnaire_localite: z.string().nullable(),
    etablissement_gestionnaire_complement_adresse: z.string().nullable(),
    etablissement_gestionnaire_cedex: z.string().nullable(),
    etablissement_gestionnaire_entreprise_raison_sociale: z.string(),
    geo_coordonnees_etablissement_gestionnaire: z.string().nullish(),
    etablissement_gestionnaire_region: z.string(),
    etablissement_gestionnaire_num_departement: z.string(),
    etablissement_gestionnaire_nom_departement: z.string(),
    etablissement_gestionnaire_nom_academie: z.string(),
    etablissement_gestionnaire_num_academie: z.string(),
    etablissement_gestionnaire_siren: z.string(),
    etablissement_gestionnaire_courriel: z.string().nullable(),
    etablissement_gestionnaire_published: z.boolean(),
  })
  .strict();

const etablissementReferenceSchema = z
  .object({
    etablissement_reference: z.string(),
    etablissement_reference_published: z.boolean(),
    etablissement_reference_habilite_rncp: z.boolean().nullable(),
    etablissement_reference_certifie_qualite: z.boolean().nullable(),
    etablissement_reference_date_creation: z.string().nullable(),
  })
  .strict();

const stringOrArraySchema = z.union([z.string(), z.array(z.string())]);

export const zFormationCatalogue = z
  .object({
    _id: z.string(),
    cle_ministere_educatif: z.string(),
    cfd: z.string(),
    cfd_specialite: z.string().nullable(),
    cfd_date_fermeture: z.string().nullable(),
    cfd_entree: z.string().nullable(),
    nom_academie: z.string().nullable(),
    num_academie: z.string().nullable(),
    code_postal: z.string(),
    code_commune_insee: z.string(),
    num_departement: z.string().nullable(),
    nom_departement: z.string().nullable(),
    region: z.string().nullable(),
    localite: z.string().nullable(),
    uai_formation: z.string().nullish(),
    intitule_long: z.string().nullable(),
    intitule_court: z.string().nullable(),
    diplome: z.string(),
    niveau: z.string(),
    onisep_url: z.string().nullable(),
    onisep_intitule: z.string().nullable(),
    onisep_libelle_poursuite: z.string().nullable(),
    onisep_lien_site_onisepfr: z.string().nullable(),
    onisep_discipline: z.string().nullable(),
    onisep_domaine_sousdomaine: z.string().nullable(),
    rncp_code: z.string().nullable(),
    rncp_intitule: z.string().nullable(),
    rncp_eligible_apprentissage: z.boolean().nullable(),
    rncp_details: z.record(z.unknown()).nullable(),
    rome_codes: z.array(z.string()).nullable(),
    capacite: z.string().nullable(),
    duree: z.string(),
    annee: z.string(),
    email: z.string().nullable(),
    published: z.boolean(),
    created_at: z.string(),
    last_update_at: z.string(),
    lieu_formation_geo_coordonnees: z.string().nullable(),
    lieu_formation_adresse: z.string(),
    lieu_formation_adresse_computed: z.string().nullable(),
    lieu_formation_siret: z.string().nullish(),
    id_rco_formation: z.string(),
    id_formation: z.string(),
    id_action: z.string(),
    ids_action: z.array(z.string()),
    id_certifinfo: z.string(),
    tags: z.array(z.string()),
    libelle_court: stringOrArraySchema.nullable(),
    niveau_formation_diplome: z.string().nullable(),
    bcn_mefs_10: z.array(z.record(z.unknown())),
    distance_lieu_formation_etablissement_formateur: z.number().nullable(),
    niveau_entree_obligatoire: z.number().nullable(),
    entierement_a_distance: z.boolean(),
    catalogue_published: z.boolean(),
    contenu: z.string().nullable(),
    objectif: z.string().nullable(),
    date_debut: z.array(z.string()).nullable(),
    date_fin: z.array(z.string()).nullable(),
    modalites_entrees_sorties: z.array(z.boolean()),
    num_tel: z.string().nullable().describe("Numéro de téléphone de contact"),
    distance: z.number().nullable(),
  })
  .strict()
  .merge(etablissementFormateurSchema)
  .merge(etablissementGestionnaireSchema)
  .merge(etablissementReferenceSchema);

export const zSourceCatalogue = z
  .object({
    _id: zObjectId,
    date: z.date(),
    data: zFormationCatalogue.strict(),
  })
  .strict();

export type IFormationCatalogue = z.output<typeof zFormationCatalogue>;
export type ISourceCatalogue = z.output<typeof zSourceCatalogue>;

export default {
  zod: zSourceCatalogue,
  indexes,
  collectionName,
};
