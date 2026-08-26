import { getDbCollection } from "@/services/mongodb/mongodbService.js"

export const up = async () => {
  await getDbCollection("users").updateMany({}, { $unset: { objectif: "", activite: "", cas_usage: "" } }, { bypassDocumentValidation: true })
  await getDbCollection("users").updateMany({ prenom: { $exists: false } }, { $set: { prenom: null, nom: null } }, { bypassDocumentValidation: true })
  await getDbCollection("users").updateMany({ description: { $exists: false } }, { $set: { description: null } }, { bypassDocumentValidation: true })
}

export const requireShutdown: boolean = true
