import { captureException } from "@sentry/node";
import { modelDescriptors } from "shared/models/models";

import { startCLI } from "./commands.js";
import config from "./config.js";
import { setupJobProcessor } from "./jobs/jobs.js";
import logger from "./services/logger.js";
import { initMailer } from "./services/mailer/mailer.js";
import { configureDbSchemaValidation, connectToMongodb } from "./services/mongodb/mongodbService.js";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function () {
  try {
    await connectToMongodb(config.mongodb.uri);
    await configureDbSchemaValidation(modelDescriptors);

    // We need to setup even for server to be able to call addJob
    await setupJobProcessor();

    await initMailer();

    await startCLI();
  } catch (err) {
    captureException(err);
    logger.error({ err }, "startup error");
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();
