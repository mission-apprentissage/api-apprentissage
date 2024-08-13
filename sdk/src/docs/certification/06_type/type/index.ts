import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

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
