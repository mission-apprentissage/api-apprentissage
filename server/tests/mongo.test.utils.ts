import { modelDescriptors } from "shared/models/models";
import { beforeAll, beforeEach } from "vitest";

import config from "@/config";
import {
  clearAllCollections,
  closeMongodbConnection,
  configureDbSchemaValidation,
  connectToMongodb,
  createIndexes,
} from "@/services/mongodb/mongodbService";

export const startAndConnectMongodb = async () => {
  const workerId = `${process.env.VITEST_POOL_ID}-${process.env.VITEST_WORKER_ID}`;

  await connectToMongodb(config.mongodb.uri.replace("VITEST_POOL_ID", workerId));
  await Promise.all([createIndexes(), configureDbSchemaValidation(modelDescriptors)]);
};

export const stopMongodb = async () => {
  await closeMongodbConnection();
};

export const useMongo = () => {
  beforeAll(async () => {
    await startAndConnectMongodb();

    return () => stopMongodb();
  });

  beforeEach(async () => {
    await clearAllCollections();
  });
};