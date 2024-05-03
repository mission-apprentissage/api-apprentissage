import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const typeField: DocField = {
  name: "type",
  description,
  information,
  sample: null,
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
