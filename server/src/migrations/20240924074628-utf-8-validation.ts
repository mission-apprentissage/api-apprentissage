import { addJob } from "job-processor";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("import.meta").deleteMany({
    type: { $in: ["dares_ape_idcc", "dares_ccn", "kali_ccn"] },
  });
  await getDbCollection("source.dares.ape_idcc").deleteMany({});
  await getDbCollection("source.dares.ccn").deleteMany({});
  await getDbCollection("source.kali.ccn").deleteMany({});

  await addJob({ name: "import:dares_cape_idcc" });
  await addJob({ name: "import:dares_ccn" });
  await addJob({ name: "import:kali_ccn" });
};
