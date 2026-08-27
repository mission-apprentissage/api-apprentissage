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
}

export const requireShutdown: boolean = true
