import type { DocBusinessField } from "../../../../types.js";
import tip from "./tip.md.js";

export default <DocBusinessField>{
  metier: true,
  description: "Niveau de qualification de la certification professionnelle",
  information: null,
  notes: null,
  sample: "exemple : CAP et/ou Niveau 3",
  tags: [".cfd.sigle", ".cfd.europeen", ".cfd.formation_diplome", ".cfd.libelle"],
  tip: {
    title: "équivalence des niveaux",
    content: tip,
  },
};
