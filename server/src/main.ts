import { captureException } from "@sentry/node"

import { startCLI } from "./commands.js"
import config from "./config.js"
import { setupJobProcessor } from "./jobs/jobs.js"
import logger from "./services/logger.js"
import { initMailer } from "./services/mailer/mailer.js"
import { connectToMongodb } from "./services/mongodb/mongodbService.js"
import { closeSentry } from "./services/sentry/sentry.js"

void (async function () {
  try {
    // La validation de schéma ($jsonSchema strict) n'est PAS appliquée ici : une commande en
    // lecture seule (migrations:status, lancée par le déploiement avant la maintenance) poserait
    // le nouveau validateur alors que l'ancien serveur écrit encore. Elle est appliquée au
    // démarrage du serveur, du job processor, et après migrations:up.
    await connectToMongodb(config.mongodb.uri)

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
