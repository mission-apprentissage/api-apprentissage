import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const intituleField: DocField = {
  name: "intitule",
  description,
  information,
  sample: "exemple : Boulanger",
  tags: [".cfd.court", ".cfd.long", ".rncp"],
};
