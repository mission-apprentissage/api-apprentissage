import type { CronDef } from "job-processor";
import type { ImportStatus } from "shared";

export type Importer = CronDef & {
  getStatus(): Promise<ImportStatus>;
};
