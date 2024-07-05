import { DocTopologie } from "../../types";
import { periodeValiditeField } from "./periode_validite";
import { periodeValiditeCfdField } from "./periode_validite.cfd";
import { periodeValiditeRncpField } from "./periode_validite.rncp";

export const periodeValiditeTopologie = {
  name: "Période de validité",
  fields: {
    periodeValiditeField,
    periodeValiditeCfdField,
    periodeValiditeRncpField,
  },
} as const satisfies DocTopologie;
