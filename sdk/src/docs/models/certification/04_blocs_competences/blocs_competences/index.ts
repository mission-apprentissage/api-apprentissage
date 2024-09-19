import type { DocBusinessField } from "../../../../types.js";

export default <DocBusinessField>{
  metier: true,
  name: "blocs_competences",
  description: "Liste du (ou des) code (s) et intitulé(s) des blocs de compétences validées par la certification",
  information: null,
  sample: null,
  notes: null,
  tip: null,
  tags: [".rncp[].code", ".rncp[].intitule"],
};
