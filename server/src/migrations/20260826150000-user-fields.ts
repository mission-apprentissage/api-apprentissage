import { getDbCollection } from "@/services/mongodb/mongodbService.js"

export const up = async () => {
  // `description` est initialisée à partir des anciens champs `objectif`/`activite`/`cas_usage`
  // (concaténés, séparés par un double saut de ligne, en ignorant les valeurs vides/absentes),
  // avant que ces champs ne soient supprimés ci-dessous.
  await getDbCollection("users").updateMany(
    { description: { $exists: false } },
    [
      {
        $set: {
          description: {
            $let: {
              vars: {
                parts: {
                  $filter: {
                    input: [{ $ifNull: ["$objectif", null] }, { $ifNull: ["$activite", null] }, { $ifNull: ["$cas_usage", null] }],
                    as: "v",
                    cond: { $and: [{ $ne: ["$$v", null] }, { $ne: ["$$v", ""] }] },
                  },
                },
              },
              in: {
                $cond: [
                  { $eq: [{ $size: "$$parts" }, 0] },
                  null,
                  {
                    $reduce: {
                      input: "$$parts",
                      initialValue: "",
                      in: { $cond: [{ $eq: ["$$value", ""] }, "$$this", { $concat: ["$$value", "\n\n", "$$this"] }] },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ],
    { bypassDocumentValidation: true }
  )
  await getDbCollection("users").updateMany({}, { $unset: { objectif: "", activite: "", cas_usage: "" } }, { bypassDocumentValidation: true })
  await getDbCollection("users").updateMany(
    { $or: [{ prenom: { $exists: false } }, { nom: { $exists: false } }] },
    { $set: { prenom: null, nom: null } },
    { bypassDocumentValidation: true }
  )

  // "mission_apprentissage" n'est plus proposé qu'à titre historique : on le convertit en "autre"
  // avec une précision explicite dans `other_type`.
  await getDbCollection("users").updateMany(
    // @ts-expect-error "mission_apprentissage" n'est plus une valeur autorisée pour `type`
    { type: "mission_apprentissage" },
    { $set: { type: "autre", other_type: "Mission apprentissage" } },
    { bypassDocumentValidation: true }
  )

  // "organisme_financeur" est absorbé par "operateur_public".
  await getDbCollection("users").updateMany(
    // @ts-expect-error "organisme_financeur" n'est plus une valeur autorisée pour `type`
    { type: "organisme_financeur" },
    { $set: { type: "operateur_public" } },
    { bypassDocumentValidation: true }
  )
}

export const requireShutdown: boolean = true
