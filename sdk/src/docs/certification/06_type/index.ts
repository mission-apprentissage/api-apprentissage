import { DocTopologie } from "../../types.js";
import { typeField } from "./type/index.js";

export const typeTypologie = {
  name: "Type",
  fields: {
    typeField,
  },
} as const satisfies DocTopologie;
