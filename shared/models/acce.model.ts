import { z } from "zod";

import { extensions } from "../helpers/zodHelpers/zodPrimitives";
import { IModelDescriptor, zObjectId } from "./common";

const collectionName = "acces" as const;

const indexes: IModelDescriptor["indexes"] = [[{ numero_uai: 1 }, {}]];

// const ETATS = { // etat_etablissement
//   Ouvert: "1",
//   "À fermer": "2",
//   "À ouvrir": "3",
//   Fermé: "4",
// };

export const ZAcce = z
  .object({
    _id: zObjectId,
    numero_uai: extensions.uai,
    // MERE || FILE numero_uai_trouve	numero_uai_mere	type_rattachement
    // UAI SPEC numero_uai	specificite_uai	specificite_uai_libe	date_ouverture	date_fermeture
    // UAI ZONE numero_uai	type_zone_uai	type_zone_uai_libe	zone	zone_libe	date_ouverture	date_fermeture	date_derniere_mise_a_jour

    nature_uai: z.string().optional(),
    nature_uai_libe: z.string().optional(),
    type_uai: z.string().optional(),
    type_uai_libe: z.string().optional(),
    etat_etablissement: z.string().optional(), // 1,2,3,4
    etat_etablissement_libe: z.string().optional(),
    ministere_tutelle: z.string().optional(),
    ministere_tutelle_libe: z.string().optional(),
    tutelle_2: z.string().optional(),
    tutelle_2_libe: z.string().optional(),
    secteur_public_prive: z.string().optional(),
    secteur_public_prive_libe: z.string().optional(),
    sigle_uai: z.string().optional(),
    categorie_juridique: z.string().optional(),
    categorie_juridique_libe: z.string().optional(),
    contrat_etablissement: z.string().optional(),
    contrat_etablissement_libe: z.string().optional(),
    categorie_financiere: z.string().optional(),
    categorie_financiere_libe: z.string().optional(),
    situation_comptable: z.string().optional(),
    situation_comptable_libe: z.string().optional(),
    niveau_uai: z.string().optional(),
    niveau_uai_libe: z.string().optional(),
    commune: z.string().optional(),
    commune_libe: z.string().optional(),
    academie: z.string().optional(),
    academie_libe: z.string().optional(),
    pays: z.string().optional(),
    pays_libe: z.string().optional(),
    departement_insee_3: z.string().optional(),
    departement_insee_3_libe: z.string().optional(),
    denomination_principale: z.string().optional(),
    appellation_officielle: z.string().optional(),
    patronyme_uai: z.string().optional(),
    hebergement_etablissement: z.string().optional(),
    hebergement_etablissement_libe: z.string().optional(),
    numero_siren_siret_uai: z.string().optional(),
    numero_finess_uai: z.string().optional(),
    date_ouverture: z.string().optional(),
    date_fermeture: z.string().optional(),
    date_derniere_mise_a_jour: z.string().optional(),
    lieu_dit_uai: z.string().optional(),
    adresse_uai: z.string().optional(),
    boite_postale_uai: z.string().optional(),
    code_postal_uai: z.string().optional(),
    etat_sirad_uai: z.string().optional(),
    localite_acheminement_uai: z.string().optional(),
    pays_etranger_acheminement: z.string().optional(),
    numero_telephone_uai: z.string().optional(),
    numero_telecopieur_uai: z.string().optional(),
    mention_distribution: z.string().optional(),
    mel_uai: z.string().email().optional(),
    site_web: z.string().optional(),
    coordonnee_x: z.string().optional(),
    coordonnee_y: z.string().optional(),
    appariement: z.string().optional(),
    appariement_complement: z.string().optional(),
    localisation: z.string().optional(),
    localisation_complement: z.string().optional(),
    date_geolocalisation: z.string().optional(),
    source: z.string().optional(),

    updated_at: z.date().optional().describe("Date de mise à jour en base de données"),
    created_at: z.date().describe("Date d'ajout en base de données"),
  })
  .strict();

export type IAcce = z.output<typeof ZAcce>;

export default {
  zod: ZAcce,
  indexes,
  collectionName,
};
