import { DocTopologie } from "../../types";
import { domainesField } from "./domaines";

export const domainesTypologie = {
  name: "Domaines",
  fields: { domainesField },
} as const satisfies DocTopologie;
