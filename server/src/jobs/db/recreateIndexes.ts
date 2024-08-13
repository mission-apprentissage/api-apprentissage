import logger from '@/services/logger.js';
import { createIndexes, dropIndexes } from '@/services/mongodb/mongodbService.js';

export const recreateIndexes = async ({ drop } = { drop: false }) => {
  if (drop) {
    logger.info("Drop all existing indexes...");
    await dropIndexes();
  }
  logger.info("Create all indexes...");
  await createIndexes();
  logger.info("All indexes successfully created !");
};
