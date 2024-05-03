import { DocTopologie } from "../../types";
import { identifiantField } from "./identifiant";

export const identifiantTopologie = {
  name: "Identifiant",
  fields: {
    identifiantField,
  },
} as const satisfies DocTopologie;
