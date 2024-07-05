import { DocTopologie } from "../../types";
import { baseLegaleField } from "./base_legale";

export const baseLegaleTopologie = {
  name: "Base légale",
  fields: {
    baseLegaleField,
  },
} as const satisfies DocTopologie;
