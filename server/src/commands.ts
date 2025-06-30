import { setMaxListeners } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { captureException } from "@sentry/node";
import { parseApiAlternanceToken } from "api-alternance-sdk";
import { initModelTechnicalDocFromSource, initRouteTechnicalDocFromSource } from "api-alternance-sdk/internal";
import { program } from "commander";
import { addJob, startJobProcessor } from "job-processor";
import HttpTerminator from "lil-http-terminator";
import type { OperationObject, SchemaObject } from "openapi3-ts/oas31";

import config from "./config.js";
import createServer from "./server/server.js";
import { closeMemoryCache } from "./services/apis/client.js";
import { checkDocumentationSync } from "./services/documentation/checkDocumentationSync.js";
import { createAuthToken } from "./services/forward/forwardApi.service.js";
import logger from "./services/logger.js";
import { closeMailer } from "./services/mailer/mailer.js";
import { closeMongodbConnection, getDbCollection } from "./services/mongodb/mongodbService.js";
import { closeSentry } from "./services/sentry/sentry.js";
import { sleep } from "./utils/asyncUtils.js";

program
  .configureHelp({
    sortSubcommands: true,
  })
  .hook("preAction", (_, actionCommand) => {
    const command = actionCommand.name();
    // on définit le module du logger en global pour distinguer les logs des jobs
    if (command !== "start") {
      logger.setBindings({ module: `cli:${command}` });
    }
  })
  .hook("postAction", async () => {
    closeMemoryCache();
    await closeMailer();
    await closeMongodbConnection();
    await closeSentry();

    setTimeout(() => {
      // Make sure to exit, even if we didn't close all ressources cleanly
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    }, 60_000).unref();
  });

async function startProcessor(signal: AbortSignal) {
  logger.info(`Process jobs queue - start`);
  await startJobProcessor(signal);
  logger.info(`Processor shut down`);
}

function createProcessExitSignal() {
  const abortController = new AbortController();

  let shutdownInProgress = false;
  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    (process as NodeJS.EventEmitter).on(signal, async () => {
      try {
        if (shutdownInProgress) {
          const message = `Server shut down (FORCED) (signal=${signal})`;
          logger.warn(message);
          // eslint-disable-next-line n/no-process-exit
          process.exit(1);
        }

        shutdownInProgress = true;
        logger.info(`Server is shutting down (signal=${signal})`);
        abortController.abort();
      } catch (err) {
        captureException(err);
        logger.error({ err }, "error during shutdown");
      }
    });
  });

  const signal = abortController.signal;
  setMaxListeners(100, signal);
  return signal;
}

program
  .command("start")
  .option("--withProcessor", "Exécution du processor également")
  .description("Démarre le serveur HTTP")
  .action(async ({ withProcessor = false }) => {
    try {
      const signal = createProcessExitSignal();

      const server = await createServer();
      await server.listen({ port: config.port, host: "0.0.0.0" });
      logger.info(`Server ready and listening on port ${config.port}`);

      const terminator = HttpTerminator({
        server: server.server,
        maxWaitTimeout: 50_000,
        logger: logger,
      });

      if (signal.aborted) {
        await terminator.terminate();
        return;
      }

      const tasks = [
        new Promise<void>((resolve, reject) => {
          signal.addEventListener("abort", async () => {
            try {
              await terminator.terminate();
              logger.warn("Server shut down");
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        }),
      ];

      if (withProcessor) {
        tasks.push(startProcessor(signal));
      }

      await Promise.all(tasks);
    } catch (err) {
      logger.error(err);
      captureException(err);
      throw err;
    }
  });

program
  .command("job_processor:start")
  .description("Run job processor")
  .action(async () => {
    const signal = createProcessExitSignal();
    if (config.disable_processors) {
      // The processor will exit, and be restarted by docker every day
      await sleep(24 * 3_600_000, signal);
      return;
    }

    try {
      await startProcessor(signal);
    } catch (error) {
      captureException(error);
      logger.error(error);
      program.error("Command failed", { exitCode: 1 });
    }
  });

function createJobAction(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (options: any) => {
    try {
      const { queued = false, ...payload } = options;
      const exitCode = await addJob({
        name,
        queued,
        payload,
      });

      if (exitCode) {
        program.error("Command failed", { exitCode });
      }
    } catch (err) {
      logger.error(err);
      program.error("Command failed", { exitCode: 2 });
    }
  };
}

program
  .command("db:validate")
  .description("Validate Documents")
  .option("-q, --queued", "Run job asynchronously", false)
  .action(createJobAction("db:validate"));

program
  .command("migrations:up")
  .description("Run migrations up")
  .option("-q, --queued", "Run job asynchronously", false)
  .action(createJobAction("migrations:up"));

program
  .command("migrations:status")
  .description("Check migrations status")
  .option("-q, --queued", "Run job asynchronously", false)
  .action(createJobAction("migrations:status"));

program
  .command("migrations:create")
  .description("Run migrations create")
  .requiredOption("-d, --description <string>", "description")
  .action(createJobAction("migrations:create"));

program
  .command("indexes:recreate")
  .description("Drop and recreate indexes")
  .option("-d, --drop", "Drop indexes before recreating them")
  .option("-q, --queued", "Run job asynchronously", false)
  .action(createJobAction("indexes:recreate"));

program
  .command("job:run")
  .description("Run a job")
  .requiredOption("-n, --name <string>", "Job name")
  .option("-q, --queued", "Run job asynchronously", false)
  .action(async ({ name, ...options }) => {
    return createJobAction(name)(options);
  });

program.command("document:sync:check").action(checkDocumentationSync);

program
  .command("debug:auth:token")
  .description("Create a LBA API token")
  .requiredOption("-e, --email <string>", "User email to create the token for")
  .option("-t, --ttl <string>", "Expiration time", "1y")
  .action(async ({ email, expiresIn }) => {
    const user = await getDbCollection("users").findOne({ email });

    if (!user) {
      program.error(`User with email ${email} not found`);
    }

    const organisation =
      user.organisation === null ? null : await getDbCollection("organisations").findOne({ nom: user.organisation });

    const token = await createAuthToken({ user, organisation }, expiresIn);
    logger.info({ token });

    logger.info(parseApiAlternanceToken({ token, publicKey: config.api.alternance.public_cert }));
  });

program
  .command("dev:doc:init:external:model")
  .description("Create a new model form external source")
  .argument("<sourceFile>", "Source Openapi SchemaObject file")
  .argument("<outputDocFile>", "Output doc file")
  .argument("<outputSchemaFile>", "Output spec file")
  .option("--lang <string>", "Source language", "fr")
  .action(async (sourceFile, outputDocFile, outputSchemaFile, { lang }) => {
    const sourceRaw = await readFile(join(process.cwd(), "..", sourceFile), "utf-8");
    const source: SchemaObject = JSON.parse(sourceRaw);

    const { schema, doc } = initModelTechnicalDocFromSource(source, lang);

    await writeFile(join(process.cwd(), "..", outputDocFile), JSON.stringify(doc, null, 2));
    await writeFile(join(process.cwd(), "..", outputSchemaFile), JSON.stringify(schema, null, 2));
  });

program
  .command("dev:doc:init:external:route")
  .description("Create a new model form external source")
  .argument("<sourceFile>", "Source Openapi OperationObject file")
  .argument("<outputDocFile>", "Output doc file")
  .argument("<outputOperationFile>", "Output spec file")
  .option("--lang <string>", "Source language", "fr")
  .action(async (sourceFile, outputDocFile, outputOperationFile, { lang }) => {
    const sourceRaw = await readFile(join(process.cwd(), "..", sourceFile), "utf-8");
    const source: OperationObject = JSON.parse(sourceRaw);

    const { operation, doc } = initRouteTechnicalDocFromSource(source, lang);

    await writeFile(join(process.cwd(), "..", outputDocFile), JSON.stringify(doc, null, 2));
    await writeFile(join(process.cwd(), "..", outputOperationFile), JSON.stringify(operation, null, 2));
  });

export async function startCLI() {
  await program.parseAsync(process.argv);
}
