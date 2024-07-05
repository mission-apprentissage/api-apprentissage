import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };
import tip from "./tip.md?raw" assert { type: "text" };

export const intituleNiveauField: DocField = {
  name: "intitule.niveau",
  description,
  information,
  sample: "exemple : CAP et/ou Niveau 3",
  tags: [".cfd.sigle", ".cfd.europeen", ".cfd.formation_diplome", ".cfd.libelle"],
  tip: {
    title: "équivalence des niveaux",
    content: tip,
  },
};
