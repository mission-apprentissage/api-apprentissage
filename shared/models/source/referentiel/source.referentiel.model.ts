import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../../common";

const collectionName = "source.referentiel" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ date: 1 }, {}],
  [{ "data.uai": 1, "data.siret": 1 }, {}],
  [{ "data.siret": 1, "data.uai": 1 }, {}],
  [{ "data.lieux_de_formation.uai": 1 }, {}],
  [{ "data.relations.siret": 1 }, {}],
];

export const zOrganismeReferentiel = z
  .object({
    siret: z.string(),
    uai: z.string().optional(),
    raison_sociale: z.string().optional(),
    enseigne: z.string().optional(),
    siege_social: z.boolean().optional(),
    certifications: z.array(
      z
        .object({
          code: z.string().optional(),
          type: z.literal("rncp"),
          label: z.string().optional(),
          sources: z.array(z.string().optional()).optional(),
          date_collecte: z.string().optional(),
        })
        .strict()
    ),
    contacts: z.array(
      z
        .object({
          email: z.string().optional(),
          confirmé: z.boolean().optional(),
          date_collecte: z.string().optional(),
          sources: z.array(z.string().optional()).optional(),
        })
        .strict()
    ),
    diplomes: z.array(
      z
        .object({
          code: z.string().optional(),
          type: z.literal("cfd"),
          niveau: z.string().optional(),
          label: z.string().optional(),
          sources: z.array(z.string().optional()).optional(),
          date_collecte: z.string().optional(),
        })
        .strict()
    ),
    lieux_de_formation: z.array(
      z
        .object({
          code: z.string().optional(),
          siret: z.string().optional(),
          uai: z.string().optional(),
          uai_fiable: z.boolean().optional(),
          date_collecte: z.string().optional(),
          adresse: z
            .object({
              label: z.string().optional(),
              code_postal: z.string(),
              code_insee: z.string(),
              localite: z.string(),
              departement: z
                .object({
                  code: z.string(),
                  nom: z.string(),
                })
                .strict()
                .optional(),
              region: z
                .object({
                  code: z.string(),
                  nom: z.string(),
                })
                .strict(),
              academie: z
                .object({
                  code: z.string(),
                  nom: z.string(),
                })
                .strict(),
              geojson: z
                .object({
                  type: z.string(),
                  geometry: z
                    .object({
                      type: z.string(),
                      coordinates: z.unknown(),
                    })
                    .strict(),
                  properties: z
                    .object({
                      score: z.number().optional(),
                      source: z.string().optional(),
                    })
                    .strict(),
                })
                .strict()
                .optional(),
            })
            .strict()
            .optional(),

          sources: z.array(z.string().optional()).optional(),
        })
        .strict()
    ),
    nature: z.enum(["responsable", "formateur", "responsable_formateur", "inconnue"]),
    referentiels: z.array(z.string().optional()),
    relations: z
      .array(
        z
          .object({
            type: z.enum(["formateur->responsable", "responsable->formateur", "entreprise"]).optional(),
            siret: z.string(),
            uai: z.string().nullish(),
            referentiel: z.boolean().optional(),
            label: z.string().optional(),
            sources: z.array(z.string().optional()).optional(),
            date_collecte: z.string().optional(),
          })
          .strict()
      )
      .optional(),
    reseaux: z.array(
      z
        .object({
          code: z.string(),
          label: z.string(),
          sources: z.array(z.string().optional()).optional(),
          date_collecte: z.string().optional(),
        })
        .strict()
    ),
    uai_potentiels: z.array(
      z
        .object({
          uai: z.string(),
          sources: z.array(z.string().optional()).optional(),
          date_collecte: z.string().optional(),
        })
        .strict()
    ),
    numero_declaration_activite: z.string().optional(),
    qualiopi: z.boolean().optional(),
    adresse: z
      .object({
        label: z.string().optional(),
        code_postal: z.string(),
        code_insee: z.string(),
        localite: z.string(),
        departement: z
          .object({
            code: z.string(),
            nom: z.string(),
          })
          .strict()
          .optional(),
        region: z
          .object({
            code: z.string(),
            nom: z.string(),
          })
          .strict(),
        academie: z
          .object({
            code: z.string(),
            nom: z.string(),
          })
          .strict(),
        geojson: z
          .object({
            type: z.string(),
            geometry: z
              .object({
                type: z.string(),
                coordinates: z.unknown(),
              })
              .strict(),
            properties: z
              .object({
                score: z.number().optional(),
                source: z.string().optional(),
              })
              .strict(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    etat_administratif: z.enum(["actif", "fermé"]).optional(),
    forme_juridique: z
      .object({
        code: z.string(),
        label: z.string(),
      })
      .strict()
      .optional(),
    _meta: z
      .object({
        date_import: z.string().optional(),
        date_dernier_import: z.string().optional(),
        date_collecte: z.string().optional(),
        uai_probable: z.string().optional(),
        nouveau: z.boolean(),
        anomalies: z.array(
          z
            .object({
              key: z.string(),
              type: z.string(),
              job: z.string(),
              sources: z.array(z.string().optional()).optional(),
              date: z.string().optional(),
              code: z.string().optional(),
              details: z.string(),
              date_collecte: z.string().optional(),
            })
            .strict()
        ),
      })
      .strict()
      .optional(),
  })
  .strict();

export const zSourceReferentiel = z
  .object({
    _id: zObjectId,
    date: z.date(),
    data: zOrganismeReferentiel.strict(),
  })
  .strict();

export type ISourceReferentiel = z.output<typeof zSourceReferentiel>;

export type IOrganismeReferentiel = z.output<typeof zOrganismeReferentiel>;

export default {
  zod: zSourceReferentiel,
  indexes,
  collectionName,
};
