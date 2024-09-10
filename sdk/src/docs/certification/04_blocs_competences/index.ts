import type { DocTopologie } from "../../types.js";
import { blocsCompetencesField } from "./blocs_competences/index.js";

export const blocsCompetencesTopologie = {
  name: "Blocs de compétences",
  fields: {
    blocsCompetencesField,
  },
} as const satisfies DocTopologie;
