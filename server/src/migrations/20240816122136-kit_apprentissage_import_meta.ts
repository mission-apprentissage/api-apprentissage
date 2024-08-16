import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("import.meta").updateMany(
    { type: "kit_apprentissage", status: "pending" },
    { $set: { status: "done" } }
  );
};
