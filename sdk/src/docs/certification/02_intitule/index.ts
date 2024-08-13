import { DocTopologie } from "../../types.js";
import { intituleNiveauField } from "./intitule.niveau/index.js";
import { intituleField } from "./intitule/index.js";

export const intituleTopologie = {
  name: "Intitulé",
  fields: {
    intituleField,
    intituleNiveauField,
  },
} as const satisfies DocTopologie;
