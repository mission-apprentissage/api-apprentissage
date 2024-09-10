import type { DocTopologie } from "../../types.js";
import { domainesField } from "./domaines/index.js";

export const domainesTypologie = {
  name: "Domaines",
  fields: { domainesField },
} as const satisfies DocTopologie;
