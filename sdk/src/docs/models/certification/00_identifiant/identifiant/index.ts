import type { DocBusinessField } from "../../../../types.js";
import information from "./information.md.js";
import tip from "./tip.md.js";

export default {
  type: "business",
  name: "identifiant",
  description:
    "**Une certification correspond à un couple CFD-RNCP sur une période donnée.** Le Code Formation Diplôme (CFD) ou code scolarité référence la certification dans la Base Centrale des Nomenclature. Le code RNCP référence la certification dans le Répertoire National des Certifications Professionnelle.",
  information,
  sample: "exemple : La certification correspond au couple CFD 50022137 - RNCP37537",
  tags: [".cfd", ".rncp", ".rncp_anterieur_2019"],
  tip: {
    title: "structure des codes CFD et RNCP",
    content: tip,
  },
  notes:
    "- les fiches RNCP antérieures à la réforme de 2019 ont certaines données qui ne sont pas renseignées, elles sont identifiées par le champ `rncp_anterieur_2019` à `true`.",
} satisfies DocBusinessField;
