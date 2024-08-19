import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("import.meta").updateMany(
    // @ts-expect-error
    { status: null },
    { $set: { status: "done" } },
    { bypassDocumentValidation: true }
  );
};
