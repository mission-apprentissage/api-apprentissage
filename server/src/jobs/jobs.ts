import { addJob, initJobProcessor } from "job-processor";
import { zImportMetaFranceCompetence, zImportMetaNpec } from "shared/models/import.meta.model";
import { z } from "zod";

import config from "@/config.js";
import { checkDocumentationSync } from "@/services/documentation/checkDocumentationSync.js";
import logger, { createJobProcessorLogger } from "@/services/logger.js";
import { createIndexes, getDatabase } from "@/services/mongodb/mongodbService.js";

import { validateModels } from "./db/schemaValidation.js";
import { runAcceImporter } from "./importer/acce/acce.js";
import { runBcnImporter } from "./importer/bcn/bcn.importer.js";
import { runCatalogueImporter } from "./importer/catalogue/catalogue.importer.js";
import { importCertifications } from "./importer/certifications/certifications.importer.js";
import { runCommuneImporter } from "./importer/commune/commune.importer.js";
import { runDaresApeIdccImporter } from "./importer/dares/ape_idcc/dares.ape_idcc.importer.js";
import { runDaresConventionCollectivesImporter } from "./importer/dares/ccn/dares.ccn.importer.js";
import {
  importRncpArchive,
  onImportRncpArchiveFailure,
  runRncpImporter,
} from "./importer/france_competence/france_competence.importer.js";
import { runKaliConventionCollectivesImporter } from "./importer/kali/kali.ccn.importer.js";
import { runKitApprentissageImporter } from "./importer/kit/kitApprentissage.importer.js";
import { importNpecResource, onImportNpecResourceFailure, runNpecImporter } from "./importer/npec/npec.importer.js";
import { runReferentielImporter } from "./importer/referentiel/referentiel.js";
import { updateKitApprentissageIndicateurSource } from "./indicateurs/source/kitApprentissage.source.indicateur.js";
import { create as createMigration, status as statusMigration, up as upMigration } from "./migrations/migrations.js";

const timings = {
  import_source: "0 4 * * *",
  certif: "0 */2 * * *",
  morning: "0 0 * * *",
};

export async function setupJobProcessor() {
  return initJobProcessor({
    db: getDatabase(),
    logger: createJobProcessorLogger(logger),
    crons:
      config.env === "preview"
        ? {}
        : {
            "Mise à jour acce": {
              cron_string: timings.import_source,
              handler: runAcceImporter,
              resumable: true,
            },
            "Import des données BCN": {
              cron_string: timings.import_source,
              handler: runBcnImporter,
              resumable: true,
            },
            "Import des données Kit Apprentissage": {
              cron_string: timings.import_source,
              handler: runKitApprentissageImporter,
              resumable: true,
            },
            "Import des données Referentiel": {
              cron_string: timings.import_source,
              handler: runReferentielImporter,
              resumable: true,
            },
            "Import des données Catalogue": {
              cron_string: timings.import_source,
              handler: runCatalogueImporter,
              resumable: true,
            },
            "Import des données France Compétences": {
              cron_string: timings.import_source,
              handler: runRncpImporter,
              resumable: true,
            },
            "Import des certifications": {
              cron_string: timings.certif,
              handler: async () => importCertifications(),
              resumable: true,
            },
            "Import des NPEC": {
              cron_string: timings.import_source,
              handler: async () => runNpecImporter(),
              resumable: true,
            },
            "Import des Conventions Collective Kali": {
              cron_string: timings.import_source,
              handler: runKaliConventionCollectivesImporter,
              resumable: true,
            },
            "Import des Conventions Collective Dares": {
              cron_string: timings.import_source,
              handler: runDaresConventionCollectivesImporter,
              resumable: true,
            },
            "Import des APE-IDCC Dares": {
              cron_string: timings.import_source,
              handler: runDaresApeIdccImporter,
              resumable: true,
            },
            "Import des Communes": {
              cron_string: timings.import_source,
              handler: async () => runCommuneImporter(),
              resumable: true,
            },
            "Controle synchronisation de la documentation": {
              cron_string: timings.morning,
              handler: async () => checkDocumentationSync,
              resumable: true,
            },
          },
    jobs: {
      "indexes:recreate": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (job) => createIndexes(job.payload as any),
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
      "import:commmunes": {
        handler: async () => runCommuneImporter(),
      },
      "import:france_competence": {
        handler: async () => runRncpImporter(),
      },
      "import:kali_ccn": {
        handler: async (_job, signal) => runKaliConventionCollectivesImporter(signal),
        resumable: true,
      },
      "import:dares_ccn": {
        handler: async (_job, signal) => runDaresConventionCollectivesImporter(signal),
        resumable: true,
      },
      "import:dares_cape_idcc": {
        handler: async (_job, signal) => runDaresApeIdccImporter(signal),
        resumable: true,
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
      "indicateurs:source_kit_apprentissage:update": {
        handler: updateKitApprentissageIndicateurSource,
        resumable: true,
      },
    },
  });
}
