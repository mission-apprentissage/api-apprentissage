import type { DocBusinessField } from "../../../../types.js";
import description from "./description.md.js";

export default <DocBusinessField>{
  type: "business",
  name: "type",
  description,
  information: null,
  sample: null,
  notes: null,
  tip: null,
  tags: [
    ".nature.cfd.code",
    ".nature.cfd.libelle",
    ".gestionnaire_diplome",
    ".certificateurs_rncp[].siret",
    ".certificateurs_rncp[].nom",
    ".enregistrement_rncp",
    ".voie_acces.rncp",
  ],
};
