import { DocTopologie } from "../../types";
import { conventionsCollectivesField } from "./conventions_collectives";

export const conventionsCollectivesTopologie = {
  name: "Conventions collectives",
  fields: { conventionsCollectivesField },
} as const satisfies DocTopologie;
