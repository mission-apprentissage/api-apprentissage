import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const blocsCompetencesField: DocField = {
  name: "blocs_competences",
  description,
  information,
  sample: null,
  tags: [".rncp[].code", ".rncp[].intitule"],
};
