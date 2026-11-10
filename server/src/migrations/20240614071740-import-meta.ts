import { getDbCollection } from "@/services/mongodb/mongodbService.js"

export const up = async () => {
  await getDbCollection("import.meta").updateMany({ type: { $nin: ["bcn", "kit_apprentissage"] } }, { $set: { status: "done" } }, { bypassDocumentValidation: true })
}
