import { DocTopologie } from "../../types.js";
import { periodeValiditeCfdField } from "./periode_validite.cfd/index.js";
import { periodeValiditeRncpField } from "./periode_validite.rncp/index.js";
import { periodeValiditeField } from "./periode_validite/index.js";

export const periodeValiditeTopologie = {
  name: "Période de validité",
  fields: {
    periodeValiditeField,
    periodeValiditeCfdField,
    periodeValiditeRncpField,
  },
} as const satisfies DocTopologie;
