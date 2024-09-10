import { modelDescriptors } from "shared/models/models";
import { beforeAll, beforeEach } from "vitest";

import config from "@/config.js";
import {
  clearAllCollections,
  closeMongodbConnection,
  configureDbSchemaValidation,
  connectToMongodb,
  createIndexes,
} from "@/services/mongodb/mongodbService.js";

export const startAndConnectMongodb = async () => {
  const workerId = `${process.env.VITEST_POOL_ID}-${process.env.VITEST_WORKER_ID}`;

  await connectToMongodb(config.mongodb.uri.replace("VITEST_POOL_ID", workerId));
  await Promise.all([createIndexes(), configureDbSchemaValidation(modelDescriptors)]);
};

export const stopMongodb = async () => {
  await closeMongodbConnection();
};

export const useMongo = (clearStep: "beforeEach" | "beforeAll" = "beforeEach") => {
  beforeAll(async () => {
    await startAndConnectMongodb();
    if (clearStep === "beforeAll") await clearAllCollections();

    return async () => stopMongodb();
  });

  beforeEach(async () => {
    if (clearStep === "beforeEach") await clearAllCollections();
  });
};
