import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("source.france_competence").updateMany(
    {},
    { $unset: { files: "" } },
    { bypassDocumentValidation: true }
  );
};
