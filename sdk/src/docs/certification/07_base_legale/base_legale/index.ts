import type { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";

export const baseLegaleField: DocField = {
  name: "base_legale",
  description,
  information,
  sample: null,
  tags: [".cfd.creation", ".cfd.abrogation"],
};
