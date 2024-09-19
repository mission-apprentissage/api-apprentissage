import type { DocBusinessField } from "../../../../types.js";
import description from "./description.md.js";
import notes from "./notes.md.js";

export default <DocBusinessField>{
  metier: true,
  description,
  information: null,
  sample: null,
  notes,
  tip: null,
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
