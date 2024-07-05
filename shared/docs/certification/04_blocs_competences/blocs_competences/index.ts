import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const blocsCompetencesField: DocField = {
  name: "blocs_competences",
  description,
  information,
  sample: null,
  tags: [".rncp[].code", ".rncp[].intitule"],
};
