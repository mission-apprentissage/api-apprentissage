import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const periodeValiditeCfdField: DocField = {
  name: "periode_validite.cfd",
  description,
  information,
  sample: null,
  tags: [".ouverture", ".fermeture", ".premiere_session", ".derniere_session"],
};
