import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("organisations").updateMany({}, { $set: { habilitations: [] } });
};
