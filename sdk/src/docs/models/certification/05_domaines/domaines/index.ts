import type { DocBusinessField } from "../../../../types.js";
import description from "./description.md.js";

export default <DocBusinessField>{
  type: "business",
  description,
  information: null,
  sample: null,
  notes: null,
  tip: null,
  tags: [
    ".nsf.cfd[].code",
    ".nsf.cfd[].intitule",
    ".nsf.rncp[].code",
    ".nsf.rncp[].intitule",
    ".rome.rncp[].code",
    ".rome.rncp[].intitule",
    ".formacodes.rncp[].code",
    ".formacodes.rncp[].intitule",
  ],
};
