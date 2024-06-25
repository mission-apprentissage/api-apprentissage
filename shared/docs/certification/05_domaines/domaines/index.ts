import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const domainesField: DocField = {
  name: "domaines",
  description,
  information,
  sample: null,
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
} as const;
