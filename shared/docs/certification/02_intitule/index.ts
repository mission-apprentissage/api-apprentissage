import { DocTopologie } from "../../types";
import { intituleField } from "./intitule";
import { intituleNiveauField } from "./intitule.niveau";

export const intituleTopologie = {
  name: "Intitulé",
  fields: {
    intituleField,
    intituleNiveauField,
  },
} as const satisfies DocTopologie;
