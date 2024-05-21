import { z } from "zod";

import { IModelDescriptor, zObjectId } from "../../common";

const collectionName = "source.acce" as const;

const indexes: IModelDescriptor["indexes"] = [
  [{ date: 1, source: 1 }, {}],
  [{ source: 1, "data.numero_uai": 1 }, {}],
];

const zUaiBaseFields = z
  .object({
    nature_uai: z.string().regex(/^\d{3}$/),
    nature_uai_libe: z.string(),
    type_uai: z.string(),
    type_uai_libe: z.string(),
    etat_etablissement: z.enum(["1", "2", "3", "4"]),
    etat_etablissement_libe: z.enum(["Ouvert", "À fermer", "À ouvrir", "Fermé"]),
    ministere_tutelle: z.string().regex(/^\d{2}$/),
    ministere_tutelle_libe: z.string(),
    tutelle_2: z
      .string()
      .regex(/^\d{2}$/)
      .nullable(),
    tutelle_2_libe: z.string().nullable(),
    secteur_public_prive: z.enum(["PR", "PU"]),
    secteur_public_prive_libe: z.enum(["Privé", "Public"]),
    sigle_uai: z.string().nullable(),
    categorie_juridique: z.string(),
    categorie_juridique_libe: z.string(),
    contrat_etablissement: z.enum(["99", "10", "30", "20", "50", "31", "21", "!!", "40", "41", "60"]),
    contrat_etablissement_libe: z.enum([
      "Sans objet",
      "Hors contrat",
      "Contrat d'association pour toutes les classes",
      "Contrat simple pour toutes les classes",
      "Reconnu par l'Etat",
      "Contrat d'association pour une partie des classes",
      "Contrat simple pour une partie des classes",
      "Inconnu du gestionnaire",
      "Contrats simple et d'association pour toutes les classes",
      "Contrats simple et d'association pour une partie des classes",
      "Sous contrat établissement agricole",
    ]),
    categorie_financiere: z.string().nullable(),
    categorie_financiere_libe: z.string().nullable(),
    situation_comptable: z.string(),
    situation_comptable_libe: z.string(),
    niveau_uai: z.enum(["1", "3", "2", "4"]),
    niveau_uai_libe: z.enum(["UAI célibataire", "UAI fille", "UAI mère", "UAI mère et fille"]),
    commune: z.string(),
    commune_libe: z.string().nullable(),
    academie: z
      .string()
      .regex(/^\d{2}$/)
      .nullable(),
    academie_libe: z.string().nullable(),
    pays: z.string(),
    pays_libe: z.string(),
    departement_insee_3: z.string().nullable(),
    departement_insee_3_libe: z.string().nullable(),
    denomination_principale: z.string().nullable(),
    appellation_officielle: z.string().nullable(),
    patronyme_uai: z.string().nullable(),
    hebergement_etablissement: z.string(),
    hebergement_etablissement_libe: z.string(),
    numero_siren_siret_uai: z.string().nullable(),
    numero_finess_uai: z.string().nullable(),
    date_ouverture: z.coerce.string(),
    date_fermeture: z.string().nullable(),
    date_derniere_mise_a_jour: z.string(),
    lieu_dit_uai: z.string().nullable(),
    adresse_uai: z.string().nullable(),
    boite_postale_uai: z.string().nullable(),
    code_postal_uai: z.string().nullable(),
    etat_sirad_uai: z.string().nullable(),
    localite_acheminement_uai: z.string().nullable(),
    pays_etranger_acheminement: z.string().nullable(),
    numero_telephone_uai: z.string().nullable(),
    numero_telecopieur_uai: z.string().nullable(),
    mention_distribution: z.string().nullable(),
    mel_uai: z.string().nullable(),
    site_web: z.string().nullable(),
    coordonnee_x: z.coerce.number().nullable(),
    coordonnee_y: z.coerce.number().nullable(),
    appariement: z.string().nullable(),
    appariement_complement: z.string().nullable(),
    localisation: z.string().nullable(),
    localisation_complement: z.string().nullable(),
    date_geolocalisation: z.string().nullable(),
    source: z.string().nullable(),
  })
  .strict();

export const zAcceUai = z
  .object({
    _id: zObjectId,
    source: z.literal("ACCE_UAI.csv"),
    date: z.date(),
    data: zUaiBaseFields
      .extend({
        numero_uai: z.string(),
      })
      .strict(),
  })
  .strict();

export const zAcceUaiZone = z
  .object({
    _id: zObjectId,
    source: z.literal("ACCE_UAI_ZONE.csv"),
    date: z.date(),
    data: z
      .object({
        numero_uai: z.string(),
        type_zone_uai: z.string(),
        type_zone_uai_libe: z.string(),
        zone: z.string(),
        zone_libe: z.string(),
        date_ouverture: z.string(),
        date_fermeture: z.string().nullable(),
        date_derniere_mise_a_jour: z.string().nullable(),
      })
      .strict(),
  })
  .strict();

export const zAcceUaiSpec = z
  .object({
    _id: zObjectId,
    source: z.literal("ACCE_UAI_SPEC.csv"),
    date: z.date(),
    data: z
      .object({
        numero_uai: z.string(),
        specificite_uai: z.string(),
        specificite_uai_libe: z.string(),
        date_ouverture: z.string(),
        date_fermeture: z.string().nullable(),
      })
      .strict(),
  })
  .strict();

export const zAcceUaiMere = z
  .object({
    _id: zObjectId,
    source: z.literal("ACCE_UAI_MERE.csv"),
    date: z.date(),
    data: zUaiBaseFields
      .extend({
        numero_uai_trouve: z.string(),
        numero_uai_mere: z.string(),
        type_rattachement: z.string(),
      })
      .strict(),
  })
  .strict();

export const zAcceUaiFille = z
  .object({
    _id: zObjectId,
    source: z.literal("ACCE_UAI_FILLE.csv"),
    date: z.date(),
    data: zUaiBaseFields
      .extend({
        numero_uai_trouve: z.string(),
        numero_uai_fille: z.string(),
        type_rattachement: z.string(),
      })
      .strict(),
  })
  .strict();

export const ZAcceByType = {
  "ACCE_UAI.csv": zAcceUai,
  "ACCE_UAI_ZONE.csv": zAcceUaiZone,
  "ACCE_UAI_SPEC.csv": zAcceUaiSpec,
  "ACCE_UAI_MERE.csv": zAcceUaiMere,
  "ACCE_UAI_FILLE.csv": zAcceUaiFille,
};

export const ZSourceAcce = z.discriminatedUnion("source", [
  zAcceUai,
  zAcceUaiZone,
  zAcceUaiSpec,
  zAcceUaiMere,
  zAcceUaiFille,
]);

export type ISourceAcceUai = z.output<typeof zAcceUai>;
export type ISourceAcceUaiZone = z.output<typeof zAcceUaiZone>;
export type ISourceAcceUaiSpec = z.output<typeof zAcceUaiSpec>;
export type ISourceAcceUaiMere = z.output<typeof zAcceUaiMere>;
export type ISourceAcceUaiFille = z.output<typeof zAcceUaiFille>;
export type ISourceAcce = z.output<typeof ZSourceAcce>;

export default {
  zod: ZSourceAcce,
  indexes,
  collectionName,
};
