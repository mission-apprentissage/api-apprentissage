import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const intituleField: DocField = {
  name: "intitule",
  description,
  information,
  sample: "exemple : Boulanger",
  tags: [".cfd.court", ".cfd.long", ".rncp"],
};
