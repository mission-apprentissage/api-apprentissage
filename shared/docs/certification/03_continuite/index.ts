import { DocTopologie } from "../../types";
import { continuiteField } from "./continuite";

export const continuiteTopologie = {
  name: "Continuité",
  fields: {
    continuiteField,
  },
} as const satisfies DocTopologie;
