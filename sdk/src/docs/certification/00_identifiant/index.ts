import { DocTopologie } from "../../types.js";
import { identifiantField } from "./identifiant/index.js";

export const identifiantTopologie = {
  name: "Identifiant",
  fields: {
    identifiantField,
  },
} as const satisfies DocTopologie;
