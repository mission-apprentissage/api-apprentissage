import { DocTopologie } from "../../types.js";
import { continuiteField } from "./continuite/index.js";

export const continuiteTopologie = {
  name: "Continuité",
  fields: {
    continuiteField,
  },
} as const satisfies DocTopologie;
