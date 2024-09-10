import type { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const periodeValiditeRncpField: DocField = {
  name: "periode_validite.rncp",
  description,
  information,
  sample: null,
  tags: [".actif", ".activation", ".debut_parcours", ".fin_enregistrement"],
};
