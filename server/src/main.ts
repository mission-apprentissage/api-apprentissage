import { captureException } from "@sentry/node"
import { modelDescriptors } from "shared/models/models"

import { startCLI } from "./commands.js"
import config from "./config.js"
import { setupJobProcessor } from "./jobs/jobs.js"
import logger from "./services/logger.js"
import { initMailer } from "./services/mailer/mailer.js"
import { closeSentry } from "./services/sentry/sentry.js"
import { configureDbSchemaValidation, connectToMongodb } from "./services/mongodb/mongodbService.js"

void (async function () {
  try {
    await connectToMongodb(config.mongodb.uri)
    await configureDbSchemaValidation(modelDescriptors)

    // We need to setup even for server to be able to call addJob
    await setupJobProcessor()

    await initMailer()

    await startCLI()
  } catch (err) {
    captureException(err)
    logger.error({ err }, "startup error")
    // Le flush Sentry n'est fait que par le hook postAction de commander, qui ne s'exécute
    // pas quand le démarrage échoue : sans ce closeSentry, l'événement part à la poubelle.
    await closeSentry()
    process.exit(1)
  }
})()
