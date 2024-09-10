import type { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const continuiteField: DocField = {
  name: "continuite",
  description,
  information,
  sample: null,
  tags: [
    ".cfd[].ouverture",
    ".cfd[].fermeture",
    ".cfd[].code",
    ".cfd[].courant",
    ".rncp[].activation",
    ".rncp[].fin_enregistrement",
    ".rncp[].code",
    ".rncp[].courant",
    ".rncp[].actif",
  ],
};
