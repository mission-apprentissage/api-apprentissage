import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const baseLegaleField: DocField = {
  name: "base_legale",
  description,
  information,
  sample: null,
  tags: [".cfd.creation", ".cfd.abrogation"],
};
