import { addJob, initJobProcessor } from "job-processor";
import { zImportMetaFranceCompetence, zImportMetaNpec } from "shared/models/import.meta.model";
import { z } from "zod";

import config from "@/config";
import logger, { createJobProcessorLogger } from "@/services/logger";
import { getDatabase } from "@/services/mongodb/mongodbService";

import { recreateIndexes } from "./db/recreateIndexes";
import { validateModels } from "./db/schemaValidation";
import { runExperiementalRedressementUaiSiret } from "./experimental/redressement/uai.siret";
import { runAcceImporter } from "./importer/acce/acce";
import { runBcnImporter } from "./importer/bcn/bcn.importer";
import { runCatalogueImporter } from "./importer/catalogue/catalogue.importer";
import { importCertifications } from "./importer/certifications/certifications.importer";
import {
  importRncpArchive,
  onImportRncpArchiveFailure,
  runRncpImporter,
} from "./importer/france_competence/france_competence.importer";
import { runKitApprentissageImporter } from "./importer/kit/kitApprentissage.importer";
import { importNpecResource, onImportNpecResourceFailure, runNpecImporter } from "./importer/npec/npec.importer";
import { runReferentielImporter } from "./importer/referentiel/referentiel";
import { create as createMigration, status as statusMigration, up as upMigration } from "./migrations/migrations";

export async function setupJobProcessor() {
  return initJobProcessor({
    db: getDatabase(),
    logger: createJobProcessorLogger(logger),
    crons:
      config.env === "preview"
        ? {}
        : {
            "Mise à jour acce": {
              cron_string: config.env === "production" ? `0 4 * * *` : "0 5 * * *",
              handler: runAcceImporter,
              resumable: true,
            },
            "Import des données BCN": {
              cron_string: config.env === "production" ? "0 4 * * *" : "0 5 * * *",
              handler: runBcnImporter,
              resumable: true,
            },
            "Import des données Kit Apprentissage": {
              cron_string: "0 4 * * *",
              handler: runKitApprentissageImporter,
              resumable: true,
            },
            "Import des données Referentiel": {
              cron_string: config.env === "production" ? "0 4 * * *" : "0 5 * * *",
              handler: runReferentielImporter,
              resumable: true,
            },
            "Import des données Catalogue": {
              cron_string: config.env === "production" ? "0 4 * * *" : "0 5 * * *",
              handler: runCatalogueImporter,
              resumable: true,
            },
            "Import des données France Compétences": {
              cron_string: config.env === "production" ? "0 4 * * *" : "0 5 * * *",
              handler: runRncpImporter,
              resumable: true,
            },
            "Import des certifications": {
              cron_string: "0 */2 * * *",
              handler: () => importCertifications(),
              resumable: true,
            },
            "Import des NPEC": {
              cron_string: config.env === "production" ? "0 4 * * *" : "0 5 * * *",
              handler: () => runNpecImporter(),
              resumable: true,
            },
          },
    jobs: {
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
      "import:kit_apprentissage": {
        handler: async () => runKitApprentissageImporter(),
      },
      "import:referentiel": {
        handler: async () => runReferentielImporter(),
      },
      "import:catalogue": {
        handler: async () => runCatalogueImporter(),
      },
      "import:france_competence": {
        handler: async () => runRncpImporter(),
      },
      "import:france_competence:resource": {
        handler: async (job, signal) => importRncpArchive(zImportMetaFranceCompetence.parse(job.payload), signal),
        onJobExited: async (job) => {
          if (job.status === "errored") {
            await onImportRncpArchiveFailure(zImportMetaFranceCompetence.parse(job.payload));
          }
        },
        resumable: true,
      },
      "import:npec": {
        handler: async () => runNpecImporter(),
      },
      "import:npec:resource": {
        handler: async (job, signal) => importNpecResource(zImportMetaNpec.parse(job.payload), signal),
        onJobExited: async (job) => {
          if (job.status === "errored") {
            await onImportNpecResourceFailure(zImportMetaNpec.parse(job.payload));
          }
        },
        resumable: true,
      },
      "import:certifications": {
        handler: async (job) =>
          importCertifications(
            z
              .object({
                force: z.boolean().optional(),
              })
              .nullish()
              .parse(job.payload)
          ),
        resumable: true,
      },
      "experimental:redressement:uai-siret": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (job) => runExperiementalRedressementUaiSiret(job.payload as any),
      },
    },
  });
}
