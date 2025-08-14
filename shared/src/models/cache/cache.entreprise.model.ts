import { zSiret } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../common.js";
import { zObjectIdMini } from "../common.js";

const collectionName = "cache.entreprise" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "data.type": 1, identifiant: 1 }, { unique: true }],
  [{ identifiant: 1 }, {}],
  [{ ttl: 1 }, { expireAfterSeconds: 0 }],
];

export const zApiEntUniteLegale = z.object({
  siren: z.string(),
  type: z.enum(["personne_morale", "personne_physique"]),
  personne_morale_attributs: z.object({
    raison_sociale: z.nullable(z.string()),
    sigle: z.nullable(z.string()),
  }),
  personne_physique_attributs: z.object({
    prenom_usuel: z.nullable(z.string()),
    nom_usage: z.nullable(z.string()),
    nom_naissance: z.nullable(z.string()),
  }),
  etat_administratif: z.enum(["A", "C"]),
  date_creation: z.nullable(z.number()),
  date_cessation: z.nullable(z.number()),
});

const zStringAdresseLine = z.pipe(
  z.nullable(z.string()),
  z.pipe(
    z.transform((v: string | null) => (v === "[ND]" ? null : v)),
    z.nullable(z.string()) // Add this last validation to have proper output type defined
  )
);

export const zApiEntEtablissement = z.object({
  siret: zSiret,
  etat_administratif: z.enum(["A", "F"]),
  date_creation: z.nullable(z.number()),
  date_fermeture: z.nullable(z.number()),
  enseigne: z.nullable(z.string()),
  unite_legale: z.omit(zApiEntUniteLegale, {
    date_cessation: true,
  }),
  adresse: z.object({
    numero_voie: z._default(zStringAdresseLine, null),
    indice_repetition_voie: zStringAdresseLine,
    type_voie: zStringAdresseLine,
    libelle_voie: zStringAdresseLine,
    complement_adresse: zStringAdresseLine,
    code_commune: z.nullable(z.string()),
    code_postal: zStringAdresseLine,
    libelle_commune: z.nullable(z.string()),
    libelle_commune_etranger: zStringAdresseLine,
    code_pays_etranger: zStringAdresseLine,
    libelle_pays_etranger: zStringAdresseLine,
  }),
});

export const zCacheApiEntEtablissement = z.object({
  _id: zObjectIdMini,
  identifiant: z.string(),
  ttl: z.nullable(z.date()),
  data: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("etablissement"),
      etablissement: z.nullable(zApiEntEtablissement),
    }),
    z.object({
      type: z.literal("unite_legale"),
      unite_legale: z.nullable(zApiEntUniteLegale),
    }),
  ]),
});

export type IApiEntUniteLegale = z.output<typeof zApiEntUniteLegale>;

export type IApiEntEtablissement = z.output<typeof zApiEntEtablissement>;

export type ICacheApiEntEtablissement = z.output<typeof zCacheApiEntEtablissement>;

export default {
  zod: zCacheApiEntEtablissement,
  indexes,
  collectionName,
};
