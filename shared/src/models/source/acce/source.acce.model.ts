import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.acce" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date: 1, source: 1 }, {}],
  [{ source: 1, "data.numero_uai": 1 }, {}],
];

const zUaiBaseFields = z.object({
  nature_uai: z.string().check(z.regex(/^\d{3}$/)),
  nature_uai_libe: z.string(),
  type_uai: z.string(),
  type_uai_libe: z.string(),
  etat_etablissement: z.enum(["1", "2", "3", "4"]),
  etat_etablissement_libe: z.enum(["Ouvert", "À fermer", "À ouvrir", "Fermé"]),
  ministere_tutelle: z.string().check(z.regex(/^\d{2}$/)),
  ministere_tutelle_libe: z.string(),
  tutelle_2: z.nullable(z.string().check(z.regex(/^\d{2}$/))),
  tutelle_2_libe: z.nullable(z.string()),
  secteur_public_prive: z.enum(["PR", "PU"]),
  secteur_public_prive_libe: z.enum(["Privé", "Public"]),
  sigle_uai: z.nullable(z.string()),
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
  categorie_financiere: z.nullable(z.string()),
  categorie_financiere_libe: z.nullable(z.string()),
  situation_comptable: z.string(),
  situation_comptable_libe: z.string(),
  niveau_uai: z.enum(["1", "3", "2", "4"]),
  niveau_uai_libe: z.enum(["UAI célibataire", "UAI fille", "UAI mère", "UAI mère et fille"]),
  commune: z.string(),
  commune_libe: z.nullable(z.string()),
  academie: z.nullable(z.string().check(z.regex(/^\d{2}$/))),
  academie_libe: z.nullable(z.string()),
  pays: z.string(),
  pays_libe: z.string(),
  departement_insee_3: z.nullable(z.string()),
  departement_insee_3_libe: z.nullable(z.string()),
  denomination_principale: z.nullable(z.string()),
  appellation_officielle: z.nullable(z.string()),
  patronyme_uai: z.nullable(z.string()),
  hebergement_etablissement: z.string(),
  hebergement_etablissement_libe: z.string(),
  numero_siren_siret_uai: z.nullable(z.string()),
  numero_finess_uai: z.nullable(z.string()),
  date_ouverture: z.coerce.string(),
  date_fermeture: z.nullable(z.string()),
  date_derniere_mise_a_jour: z.string(),
  lieu_dit_uai: z.nullable(z.string()),
  adresse_uai: z.nullable(z.string()),
  boite_postale_uai: z.nullable(z.string()),
  code_postal_uai: z.nullable(z.string()),
  etat_sirad_uai: z.nullable(z.string()),
  localite_acheminement_uai: z.nullable(z.string()),
  pays_etranger_acheminement: z.nullable(z.string()),
  numero_telephone_uai: z.nullable(z.string()),
  numero_telecopieur_uai: z.nullable(z.string()),
  mention_distribution: z.nullable(z.string()),
  mel_uai: z.nullable(z.string()),
  site_web: z.nullable(z.string()),
  coordonnee_x: z.nullable(z.coerce.number()),
  coordonnee_y: z.nullable(z.coerce.number()),
  appariement: z.nullable(z.string()),
  appariement_complement: z.nullable(z.string()),
  localisation: z.nullable(z.string()),
  localisation_complement: z.nullable(z.string()),
  date_geolocalisation: z.nullable(z.string()),
  source: z.nullable(z.string()),
});
export const zAcceUai = z.object({
  _id: zObjectId,
  source: z.literal("ACCE_UAI.csv"),
  date: z.date(),
  data: z.extend(zUaiBaseFields, {
    numero_uai: z.string(),
  }),
});

export const zAcceUaiZone = z.object({
  _id: zObjectId,
  source: z.literal("ACCE_UAI_ZONE.csv"),
  date: z.date(),
  data: z.object({
    numero_uai: z.string(),
    type_zone_uai: z.string(),
    type_zone_uai_libe: z.string(),
    zone: z.string(),
    zone_libe: z.string(),
    date_ouverture: z.string(),
    date_fermeture: z.nullable(z.string()),
    date_derniere_mise_a_jour: z.nullable(z.string()),
  }),
});

export const zAcceUaiSpec = z.object({
  _id: zObjectId,
  source: z.literal("ACCE_UAI_SPEC.csv"),
  date: z.date(),
  data: z.object({
    numero_uai: z.string(),
    specificite_uai: z.string(),
    specificite_uai_libe: z.string(),
    date_ouverture: z.string(),
    date_fermeture: z.nullable(z.string()),
  }),
});

export const zAcceUaiMere = z.object({
  _id: zObjectId,
  source: z.literal("ACCE_UAI_MERE.csv"),
  date: z.date(),
  data: z.extend(zUaiBaseFields, {
    numero_uai_trouve: z.string(),
    numero_uai_mere: z.string(),
    type_rattachement: z.string(),
  }),
});

export const zAcceUaiFille = z.object({
  _id: zObjectId,
  source: z.literal("ACCE_UAI_FILLE.csv"),
  date: z.date(),
  data: z.extend(zUaiBaseFields, {
    numero_uai_trouve: z.string(),
    numero_uai_fille: z.string(),
    type_rattachement: z.string(),
  }),
});

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
