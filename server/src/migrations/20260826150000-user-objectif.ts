import { getDbCollection } from "@/services/mongodb/mongodbService.js"

export const up = async () => {
  await getDbCollection("users").updateMany({}, { $unset: { objectif: "" } }, { bypassDocumentValidation: true })
}

export const requireShutdown: boolean = true
