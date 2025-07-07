import { getAcceeImporterStatus, runAcceImporter } from "./acce/acce.js";
import { getBcnImporterStatus, runBcnImporter } from "./bcn/bcn.importer.js";
import { getCatalogueImporterStatus, runCatalogueImporter } from "./catalogue/catalogue.importer.js";
import { getCertificationImporterStatus, importCertifications } from "./certifications/certifications.importer.js";
import { getCommuneImporterStatus, runCommuneImporter } from "./commune/commune.importer.js";
import { getDaresApiIdccImporterStatus, runDaresApeIdccImporter } from "./dares/ape_idcc/dares.ape_idcc.importer.js";
import { getDaresCcnImporterStatus, runDaresConventionCollectivesImporter } from "./dares/ccn/dares.ccn.importer.js";
import { getFormationsImporterStatus, importFormations } from "./formation/formation.importer.js";
import { getFranceCompetencesImporterStatus, runRncpImporter } from "./france_competence/france_competence.importer.js";
import { getKaliImporterStatus, runKaliConventionCollectivesImporter } from "./kali/kali.ccn.importer.js";
import { getKitApprentissageImporterStatus, runKitApprentissageImporter } from "./kit/kitApprentissage.importer.js";
import { getMissionLocaleImporterStatus, runMissionLocaleImporter } from "./mission_locale/mission_locale.importer.js";
import { getOrganismesImporterStatus, importOrganismes } from "./organisme/organisme.importer.js";
import { getReferentielImporterStatus, runReferentielImporter } from "./referentiel/referentiel.js";
import type { Importer } from "./types.js";

const timings = {
  import_source: "0 4 * * *",
  import_source_main: "0 */4 * * *",
};

export const importers: Record<string, Importer> = {
  "Mise à jour acce": {
    cron_string: timings.import_source,
    handler: runAcceImporter,
    resumable: true,
    getStatus: getAcceeImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des données BCN": {
    cron_string: timings.import_source_main,
    handler: runBcnImporter,
    resumable: true,
    getStatus: getBcnImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des données Kit Apprentissage": {
    cron_string: timings.import_source_main,
    handler: runKitApprentissageImporter,
    resumable: true,
    getStatus: getKitApprentissageImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des données Referentiel": {
    cron_string: timings.import_source_main,
    handler: runReferentielImporter,
    resumable: true,
    getStatus: getReferentielImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des données Catalogue": {
    cron_string: timings.import_source_main,
    handler: runCatalogueImporter,
    resumable: true,
    getStatus: getCatalogueImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des données France Compétences": {
    cron_string: timings.import_source,
    handler: runRncpImporter,
    resumable: true,
    getStatus: getFranceCompetencesImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des certifications": {
    cron_string: timings.import_source_main,
    handler: async () => importCertifications(),
    resumable: true,
    getStatus: getCertificationImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des organismes": {
    cron_string: timings.import_source_main,
    handler: async () => importOrganismes(false),
    resumable: true,
    getStatus: getOrganismesImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des formations": {
    cron_string: timings.import_source_main,
    handler: importFormations,
    resumable: true,
    getStatus: getFormationsImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des Conventions Collective Kali": {
    cron_string: timings.import_source,
    handler: runKaliConventionCollectivesImporter,
    resumable: true,
    getStatus: getKaliImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des Conventions Collective Dares": {
    cron_string: timings.import_source,
    handler: runDaresConventionCollectivesImporter,
    resumable: true,
    getStatus: getDaresCcnImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des APE-IDCC Dares": {
    cron_string: timings.import_source,
    handler: runDaresApeIdccImporter,
    resumable: true,
    getStatus: getDaresApiIdccImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des Missions Locales": {
    cron_string: timings.import_source,
    handler: runMissionLocaleImporter,
    resumable: true,
    getStatus: getMissionLocaleImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
  "Import des Communes": {
    cron_string: timings.import_source,
    handler: runCommuneImporter,
    resumable: true,
    getStatus: getCommuneImporterStatus,
    checkinMargin: 60, // 1h
    maxRuntimeInMinutes: 30,
  },
};
