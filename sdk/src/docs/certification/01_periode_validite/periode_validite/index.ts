import type { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const periodeValiditeField: DocField = {
  name: "periode_validite",
  description,
  information,
  sample: "exemple : du 01.09.2021 au 31.08.2026",
  tags: [".debut", ".fin"],
};
