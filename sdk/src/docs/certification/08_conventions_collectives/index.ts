import type { DocTopologie } from "../../types.js";
import { conventionsCollectivesField } from "./conventions_collectives/index.js";

export const conventionsCollectivesTopologie = {
  name: "Conventions collectives",
  fields: { conventionsCollectivesField },
} as const satisfies DocTopologie;
