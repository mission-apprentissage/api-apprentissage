import { DocTopologie } from "../../types.js";
import { baseLegaleField } from "./base_legale/index.js";

export const baseLegaleTopologie = {
  name: "Base légale",
  fields: {
    baseLegaleField,
  },
} as const satisfies DocTopologie;
