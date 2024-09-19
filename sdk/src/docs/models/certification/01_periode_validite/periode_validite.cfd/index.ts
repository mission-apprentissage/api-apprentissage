import type { DocBusinessField } from "../../../../types.js";
import description from "./description.md.js";

export default <DocBusinessField>{
  metier: true,
  description,
  information: null,
  sample: null,
  notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
  tip: null,
  tags: [".ouverture", ".fermeture", ".premiere_session", ".derniere_session"],
};
