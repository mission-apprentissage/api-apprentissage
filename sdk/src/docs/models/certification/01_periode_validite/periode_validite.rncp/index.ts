import type { DocBusinessField } from "../../../../types.js";
import description from "./description.md.js";

export default <DocBusinessField>{
  type: "business",
  name: "periode_validite.rncp",
  description,
  information:
    "Un enregistrement au RNCP est de maximum 5 ans, dépassé ce délai toute fiche doit fait l’objet d’une demande de renouvellement.",
  sample: null,
  notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
  tip: null,
  tags: [".actif", ".activation", ".debut_parcours", ".fin_enregistrement"],
};
