import { DocTopologie } from "../../types";
import { typeField } from "./type";

export const typeTypologie = {
  name: "Type",
  fields: {
    typeField,
  },
} as const satisfies DocTopologie;
