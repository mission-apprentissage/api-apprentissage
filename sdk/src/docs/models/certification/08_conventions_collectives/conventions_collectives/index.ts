import type { DocBusinessField } from "../../../../types.js";

export default <DocBusinessField>{
  metier: true,
  description: "Liste(s) de la ou des convention(s) collective(s) rattachées à la certification",
  information: null,
  sample: null,
  tip: null,
  notes: null,
  tags: [".rncp[].numero", ".rncp[].libelle"],
};
