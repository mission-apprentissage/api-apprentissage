import { addJob, initJobProcessor } from "job-processor";
import { zImportMeta } from "shared/models/import.meta.model";
import { zUserCreate } from "shared/models/user.model";

import {
  create as createMigration,
  status as statusMigration,
  up as upMigration,
} from "@/modules/jobs/migrations/migrations";

import logger from "../../common/logger";
import { getDatabase } from "../../common/utils/mongodbUtils";
import config from "../../config";
import { createUser } from "../actions/users.actions";
import { recreateIndexes } from "./db/recreateIndexes";
import { validateModels } from "./db/schemaValidation";
import { runAcceImporter } from "./importer/acce/acce";
import { runBcnImporter } from "./importer/bcn/bcn.importer";
import { runCatalogueImporter } from "./importer/catalogue/catalogue.importer";
import {
  importRncpArchive,
  onImportRncpArchiveFailure,
  runRncpImporter,
} from "./importer/france_competence/france_competence.importer";
import { runKitApprentissageImporter } from "./importer/kit/kitApprentissage.importer";
import { runReferentielImporter } from "./importer/referentiel/referentiel";

export async function setupJobProcessor() {
  return initJobProcessor({
    db: getDatabase(),
    logger,
    crons:
      config.env === "preview" || config.env === "local"
        ? {}
        : {
            "Mise à jour acce": {
              cron_string: "0 1 * * *",
              handler: runAcceImporter,
              resumable: true,
            },
            "Import des données BCN": {
              cron_string: "0 9 * * *",
              handler: runBcnImporter,
              resumable: true,
            },
            "Import des données Kit Apprentissage": {
              cron_string: "0 9 * * *",
              handler: runKitApprentissageImporter,
              resumable: true,
            },
            "Import des données Referentiel": {
              cron_string: "0 9 * * *",
              handler: runReferentielImporter,
              resumable: true,
            },
            "Import des données Catalogue": {
              cron_string: "0 9 * * *",
              handler: runCatalogueImporter,
              resumable: true,
            },
            "Import des données France Compétences": {
              cron_string: "0 9 * * *",
              handler: runRncpImporter,
              resumable: true,
            },
          },
    jobs: {
      "users:create": {
        handler: async (job) => {
          await createUser(zUserCreate.parse(job.payload));
        },
      },
      "indexes:recreate": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (job) => recreateIndexes(job.payload as any),
      },
      "db:validate": {
        handler: async () => validateModels(),
      },
      "migrations:up": {
        handler: async () => {
          await upMigration();
          // Validate all documents after the migration
          await addJob({ name: "db:validate", queued: true });
          return;
        },
      },
      "migrations:status": {
        handler: async () => {
          const pendingMigrations = await statusMigration();
          console.log(`migrations-status=${pendingMigrations === 0 ? "synced" : "pending"}`);
          return;
        },
      },
      "migrations:create": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (job) => createMigration(job.payload as any),
      },
      "import:acce": {
        handler: async () => runAcceImporter(),
      },
      "import:bcn": {
        handler: async () => runBcnImporter(),
      },
      "import:referentiel": {
        handler: async () => runReferentielImporter(),
      },
      "import:catalogue": {
        handler: async () => runCatalogueImporter(),
      },
      "import:france_competence:resource": {
        handler: async (job) => importRncpArchive(zImportMeta.parse(job.payload)),
        onJobExited: async (job) => {
          if (job.status === "errored") {
            await onImportRncpArchiveFailure(zImportMeta.parse(job.payload));
          }
        },
        resumable: true,
      },
    },
  });
}
