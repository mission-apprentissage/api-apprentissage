import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("import.meta").deleteMany({ type: "kit_apprentissage" });
  await getDbCollection("source.kit_apprentissage").deleteMany({});
  await getDbCollection("indicateurs.source_kit_apprentissage").deleteMany({});
};

export const requireShutdown: boolean = true;
