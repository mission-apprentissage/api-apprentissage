import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const conventionsCollectivesField: DocField = {
  name: "conventions_collectives",
  description,
  information,
  sample: null,
  tags: [".rncp[].numero", ".rncp[].libelle"],
};
