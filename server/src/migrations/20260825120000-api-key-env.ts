import { getDbCollection } from "@/services/mongodb/mongodbService.js"

export const up = async () => {
  // Les clés existantes conservent leur comportement actuel, étiqueté "production" ; le routage
  // des écritures selon env n'existe pas encore (phase 2 du chantier, cf. issue lba#5236)
  await getDbCollection("users").updateMany(
    {},
    {
      $set: {
        "api_keys.$[key].env": "production",
      },
    },
    { bypassDocumentValidation: true, arrayFilters: [{ "key.env": { $exists: false } }] }
  )
}

// Shutdown requis : le validateur strict exige `env` dès le boot du nouveau code — une clé créée
// par l'ancien code après la migration resterait sans `env` et bloquerait les updates du document
export const requireShutdown: boolean = true
