import type { Db } from "mongodb"

export const up = async (db: Db) => {
  // source.acce est hors des modèles (lba#5430) : getDbCollection est typé sur les collections déclarées
  await db
    .collection("source.acce")
    .drop()
    .catch((error: { codeName?: string }) => {
      if (error.codeName !== "NamespaceNotFound") throw error
    })
  await db.collection("import.meta").deleteMany({ type: "acce" })
}
