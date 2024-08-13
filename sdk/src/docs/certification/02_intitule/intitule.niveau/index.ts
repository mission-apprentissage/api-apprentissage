import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";
import tip from "./tip.md.js";

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
