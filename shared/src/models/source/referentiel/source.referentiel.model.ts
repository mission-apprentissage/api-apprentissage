import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.referentiel" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date: 1 }, {}],
  [{ "data.uai": 1, "data.siret": 1 }, {}],
  [{ "data.siret": 1, "data.uai": 1 }, {}],
  [{ "data.lieux_de_formation.uai": 1 }, {}],
  [{ "data.relations.siret": 1 }, {}],
];

export const zOrganismeReferentiel = z.object({
  siret: z.string(),
  uai: z.nullish(z.string()),
  raison_sociale: z.optional(z.string()),
  enseigne: z.optional(z.string()),
  siege_social: z.optional(z.boolean()),
  certifications: z.array(
    z.object({
      code: z.optional(z.string()),
      type: z.literal("rncp"),
      label: z.optional(z.string()),
      sources: z.optional(z.array(z.optional(z.string()))),
      date_collecte: z.optional(z.string()),
    })
  ),
  contacts: z.array(
    z.object({
      email: z.optional(z.string()),
      confirmé: z.optional(z.boolean()),
      date_collecte: z.optional(z.string()),
      sources: z.optional(z.array(z.optional(z.string()))),
    })
  ),
  diplomes: z.array(
    z.object({
      code: z.optional(z.string()),
      type: z.literal("cfd"),
      niveau: z.optional(z.string()),
      label: z.optional(z.string()),
      sources: z.optional(z.array(z.optional(z.string()))),
      date_collecte: z.optional(z.string()),
    })
  ),
  lieux_de_formation: z.array(
    z.object({
      code: z.optional(z.string()),
      siret: z.optional(z.string()),
      uai: z.optional(z.string()),
      uai_fiable: z.optional(z.boolean()),
      date_collecte: z.optional(z.string()),
      adresse: z.optional(
        z.object({
          label: z.optional(z.string()),
          code_postal: z.string(),
          code_insee: z.string(),
          localite: z.string(),
          departement: z.optional(
            z.object({
              code: z.string(),
              nom: z.string(),
            })
          ),
          region: z.object({
            code: z.string(),
            nom: z.string(),
          }),
          academie: z.object({
            code: z.string(),
            nom: z.string(),
          }),
          geojson: z.optional(
            z.object({
              type: z.string(),
              geometry: z.object({
                type: z.string(),
                coordinates: z.unknown(),
              }),
              properties: z.object({
                score: z.optional(z.number()),
                source: z.optional(z.string()),
              }),
            })
          ),
        })
      ),
      sources: z.optional(z.array(z.optional(z.string()))),
    })
  ),
  nature: z.enum(["responsable", "formateur", "responsable_formateur", "inconnue"]),
  referentiels: z.array(z.optional(z.string())),
  relations: z.optional(
    z.array(
      z.object({
        type: z.optional(z.enum(["formateur->responsable", "responsable->formateur", "entreprise"])),
        siret: z.string(),
        uai: z.nullish(z.string()),
        referentiel: z.optional(z.boolean()),
        label: z.optional(z.string()),
        sources: z.optional(z.array(z.optional(z.string()))),
        date_collecte: z.optional(z.string()),
      })
    )
  ),
  reseaux: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
      sources: z.optional(z.array(z.optional(z.string()))),
      date_collecte: z.optional(z.string()),
    })
  ),
  uai_potentiels: z.array(
    z.object({
      uai: z.string(),
      sources: z.optional(z.array(z.optional(z.string()))),
      date_collecte: z.optional(z.string()),
    })
  ),
  numero_declaration_activite: z.optional(z.string()),
  qualiopi: z.optional(z.boolean()),
  adresse: z.optional(
    z.object({
      label: z.optional(z.string()),
      code_postal: z.string(),
      code_insee: z.string(),
      localite: z.string(),
      departement: z.optional(
        z.object({
          code: z.string(),
          nom: z.string(),
        })
      ),
      region: z.object({
        code: z.string(),
        nom: z.string(),
      }),
      academie: z.object({
        code: z.string(),
        nom: z.string(),
      }),
      geojson: z.optional(
        z.object({
          type: z.string(),
          geometry: z.object({
            type: z.string(),
            coordinates: z.unknown(),
          }),
          properties: z.object({
            score: z.optional(z.number()),
            source: z.optional(z.string()),
          }),
        })
      ),
    })
  ),
  etat_administratif: z.optional(z.enum(["actif", "fermé"])),
  forme_juridique: z.optional(
    z.object({
      code: z.string(),
      label: z.string(),
    })
  ),
  _meta: z.optional(
    z.object({
      date_import: z.optional(z.string()),
      date_dernier_import: z.optional(z.string()),
      date_collecte: z.optional(z.string()),
      uai_probable: z.optional(z.string()),
      nouveau: z.boolean(),
      anomalies: z.array(
        z.object({
          key: z.string(),
          type: z.string(),
          job: z.string(),
          sources: z.optional(z.array(z.optional(z.string()))),
          date: z.optional(z.string()),
          code: z.optional(z.string()),
          details: z.string(),
          date_collecte: z.optional(z.string()),
        })
      ),
    })
  ),
});

export const zSourceReferentiel = z.object({
  _id: zObjectId,
  date: z.date(),
  data: zOrganismeReferentiel,
});

export type ISourceReferentiel = z.output<typeof zSourceReferentiel>;

export type IOrganismeReferentiel = z.output<typeof zOrganismeReferentiel>;

export default {
  zod: zSourceReferentiel,
  indexes,
  collectionName,
};
