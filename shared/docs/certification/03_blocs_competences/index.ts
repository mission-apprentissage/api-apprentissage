import { DocTopologie } from "../../types";
import { blocsCompetencesField } from "./blocs_competences";

export const blocsCompetencesTopologie = {
  name: "Blocs de compétences",
  fields: {
    blocsCompetencesField,
  },
} as const satisfies DocTopologie;
