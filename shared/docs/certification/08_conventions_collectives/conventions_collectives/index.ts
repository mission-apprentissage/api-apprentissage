import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const conventionsCollectivesField: DocField = {
  name: "conventions_collectives",
  description,
  information,
  sample: null,
  tags: [".rncp[].numero", ".rncp[].libelle"],
};
