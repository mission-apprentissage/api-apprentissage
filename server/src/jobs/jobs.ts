import { addJob, initJobProcessor } from "job-processor";
import { zImportMetaFranceCompetence, zImportMetaNpec } from "shared/models/import.meta.model";
import { z } from "zod";

import config from "@/config.js";
import { checkDocumentationSync } from "@/services/documentation/checkDocumentationSync.js";
import logger, { createJobProcessorLogger } from "@/services/logger.js";
import { createIndexes, getDatabase } from "@/services/mongodb/mongodbService.js";

import { notifyUsersAboutExpiringApiKeys } from "./apiKey/apiKeyExpiration.notifier.js";
import { validateModels } from "./db/schemaValidation.js";
import { runAcceImporter } from "./importer/acce/acce.js";
import { runBcnImporter } from "./importer/bcn/bcn.importer.js";
import { runCatalogueImporter } from "./importer/catalogue/catalogue.importer.js";
import { importCertifications } from "./importer/certifications/certifications.importer.js";
import { runCommuneImporter } from "./importer/commune/commune.importer.js";
import { runDaresApeIdccImporter } from "./importer/dares/ape_idcc/dares.ape_idcc.importer.js";
import { runDaresConventionCollectivesImporter } from "./importer/dares/ccn/dares.ccn.importer.js";
import { importFormations } from "./importer/formation/formation.importer.js";
import {
  importRncpArchive,
  onImportRncpArchiveFailure,
  runRncpImporter,
} from "./importer/france_competence/france_competence.importer.js";
import { importers } from "./importer/importers.js";
import { runKaliConventionCollectivesImporter } from "./importer/kali/kali.ccn.importer.js";
import { runKitApprentissageImporter } from "./importer/kit/kitApprentissage.importer.js";
import { runMissionLocaleImporter } from "./importer/mission_locale/mission_locale.importer.js";
import { importNpecResource, onImportNpecResourceFailure, runNpecImporter } from "./importer/npec/npec.importer.js";
import { importOrganismes } from "./importer/organisme/organisme.importer.js";
import { runReferentielImporter } from "./importer/referentiel/referentiel.js";
import { updateKitApprentissageIndicateurSource } from "./indicateurs/source/kitApprentissage.source.indicateur.js";
import { create as createMigration, status as statusMigration, up as upMigration } from "./migrations/migrations.js";

export async function setupJobProcessor() {
  return initJobProcessor({
    db: getDatabase(),
    logger: createJobProcessorLogger(logger),
    crons:
      config.env === "preview"
        ? {}
        : {
            ...importers,
            "Controle synchronisation de la documentation": {
              cron_string: "0 0 * * *",
              handler: checkDocumentationSync,
              resumable: true,
            },
            "Notification expiration clés API": {
              cron_string: "0 8 * * *",
              handler: notifyUsersAboutExpiringApiKeys,
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
          const { count, requireShutdown } = await statusMigration();
          if (count === 0) {
            console.log("migrations-status=synced");
          } else {
            console.log(`migrations-status=${requireShutdown ? "require-shutdown" : "pending"}`);
          }
          return;
        },
      },
      "migrations:create": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (job) => createMigration(job.payload as any),
      },
      "import:acce": {
        handler: runAcceImporter,
      },
      "import:bcn": {
        handler: runBcnImporter,
      },
      "import:kit_apprentissage": {
        handler: runKitApprentissageImporter,
      },
      "import:referentiel": {
        handler: runReferentielImporter,
      },
      "import:catalogue": {
        handler: runCatalogueImporter,
      },
      "import:formations": {
        handler: importFormations,
      },
      "import:communes": {
        handler: runCommuneImporter,
      },
      "import:france_competence": {
        handler: runRncpImporter,
      },
      "import:mission_locale": {
        handler: runMissionLocaleImporter,
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
        handler: runNpecImporter,
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
      "import:organismes": {
        handler: async (job) => {
          const options = z.object({ force: z.boolean().optional() }).nullish().parse(job.payload);
          return importOrganismes(options?.force ?? false);
        },
        resumable: true,
      },
      "indicateurs:source_kit_apprentissage:update": {
        handler: updateKitApprentissageIndicateurSource,
        resumable: true,
      },
      "doc:check_sync": {
        handler: checkDocumentationSync,
      },
    },
  });
}
