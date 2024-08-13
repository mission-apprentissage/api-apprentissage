import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

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
