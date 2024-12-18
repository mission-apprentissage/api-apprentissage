import { zSiret } from "api-alternance-sdk";
import { z } from "zod";

import type { IModelDescriptorGeneric } from "../common.js";
import { zObjectId } from "../common.js";

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
    raison_sociale: z.string().nullable(),
    sigle: z.string().nullable(),
  }),
  personne_physique_attributs: z.object({
    prenom_usuel: z.string().nullable(),
    nom_usage: z.string().nullable(),
  }),
  etat_administratif: z.enum(["A", "C"]),
  date_creation: z.number().nullable(),
  date_cessation: z.number().nullable(),
});

export const zApiEntEtablissement = z.object({
  siret: zSiret,
  etat_administratif: z.enum(["A", "F"]),
  date_creation: z.number().nullable(),
  date_fermeture: z.number().nullable(),
  enseigne: z.string().nullable(),
  unite_legale: zApiEntUniteLegale.omit({
    date_cessation: true,
  }),
  adresse: z.object({
    numero_voie: z.string().nullable().default(null),
    indice_repetition_voie: z.string().nullable(),
    type_voie: z.string().nullable(),
    libelle_voie: z.string().nullable(),
    complement_adresse: z.string().nullable(),
    code_commune: z.string().nullable(),
    code_postal: z.string().nullable(),
    libelle_commune: z.string().nullable(),
    libelle_commune_etranger: z.string().nullable(),
    code_pays_etranger: z.string().nullable(),
    libelle_pays_etranger: z.string().nullable(),
  }),
});

export const zCacheApiEntEtablissement = z
  .object({
    _id: zObjectId,
    identifiant: z.string().describe("SIRET ou SIREN de l'entité"),
    ttl: z.date().nullable(),
    data: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("etablissement"),
        etablissement: zApiEntEtablissement.nullable(),
      }),
      z.object({
        type: z.literal("unite_legale"),
        unite_legale: zApiEntUniteLegale.nullable(),
      }),
    ]),
  })
  .strict();

export type IApiEntUniteLegale = z.output<typeof zApiEntUniteLegale>;

export type IApiEntEtablissement = z.output<typeof zApiEntEtablissement>;

export type ICacheApiEntEtablissement = z.output<typeof zCacheApiEntEtablissement>;

export default {
  zod: zCacheApiEntEtablissement,
  indexes,
  collectionName,
};
