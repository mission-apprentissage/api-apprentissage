import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const periodeValiditeRncpField: DocField = {
  name: "periode_validite.rncp",
  description,
  information,
  sample: null,
  tags: [".actif", ".activation", ".debut_parcours", ".fin_enregistrement"],
};
