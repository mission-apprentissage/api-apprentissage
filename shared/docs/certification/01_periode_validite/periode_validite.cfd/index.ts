import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const periodeValiditeCfdField: DocField = {
  name: "periode_validite.cfd",
  description,
  information,
  sample: null,
  tags: [".ouverture", ".fermeture", ".premiere_session", ".derniere_session"],
};
