import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

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
