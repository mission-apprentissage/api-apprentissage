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
import { getNpecImporterStatus, runNpecImporter } from "./npec/npec.importer.js";
import { getOrganismesImporterStatus, importOrganismes } from "./organisme/organisme.importer.js";
import { getReferentielImporterStatus, runReferentielImporter } from "./referentiel/referentiel.js";
import type { Importer } from "./types.js";

const timings = {
  import_source: "0 4 * * *",
  certif: "0 */2 * * *",
};

export const importers: Record<string, Importer> = {
  "Mise à jour acce": {
    cron_string: timings.import_source,
    handler: runAcceImporter,
    resumable: true,
    getStatus: getAcceeImporterStatus,
  },
  "Import des données BCN": {
    cron_string: timings.import_source,
    handler: runBcnImporter,
    resumable: true,
    getStatus: getBcnImporterStatus,
  },
  "Import des données Kit Apprentissage": {
    cron_string: timings.import_source,
    handler: runKitApprentissageImporter,
    resumable: true,
    getStatus: getKitApprentissageImporterStatus,
  },
  "Import des données Referentiel": {
    cron_string: timings.import_source,
    handler: runReferentielImporter,
    resumable: true,
    getStatus: getReferentielImporterStatus,
  },
  "Import des données Catalogue": {
    cron_string: timings.import_source,
    handler: runCatalogueImporter,
    resumable: true,
    getStatus: getCatalogueImporterStatus,
  },
  "Import des données France Compétences": {
    cron_string: timings.import_source,
    handler: runRncpImporter,
    resumable: true,
    getStatus: getFranceCompetencesImporterStatus,
  },
  "Import des certifications": {
    cron_string: timings.certif,
    handler: async () => importCertifications(),
    resumable: true,
    getStatus: getCertificationImporterStatus,
  },
  "Import des organismes": {
    cron_string: timings.certif,
    handler: importOrganismes,
    resumable: true,
    getStatus: getOrganismesImporterStatus,
  },
  "Import des formations": {
    cron_string: timings.certif,
    handler: importFormations,
    resumable: true,
    getStatus: getFormationsImporterStatus,
  },
  "Import des NPEC": {
    cron_string: timings.import_source,
    handler: runNpecImporter,
    resumable: true,
    getStatus: getNpecImporterStatus,
  },
  "Import des Conventions Collective Kali": {
    cron_string: timings.import_source,
    handler: runKaliConventionCollectivesImporter,
    resumable: true,
    getStatus: getKaliImporterStatus,
  },
  "Import des Conventions Collective Dares": {
    cron_string: timings.import_source,
    handler: runDaresConventionCollectivesImporter,
    resumable: true,
    getStatus: getDaresCcnImporterStatus,
  },
  "Import des APE-IDCC Dares": {
    cron_string: timings.import_source,
    handler: runDaresApeIdccImporter,
    resumable: true,
    getStatus: getDaresApiIdccImporterStatus,
  },
  "Import des Communes": {
    cron_string: timings.import_source,
    handler: runCommuneImporter,
    resumable: true,
    getStatus: getCommuneImporterStatus,
  },
};
