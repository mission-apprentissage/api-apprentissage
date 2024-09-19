import type { DocBusinessField } from "../../../../../types.js";
import description from "./description.md.js";

export default {
  type: "business",
  description,
  tags: [],
  information:
    "At least one application method must be provided when submitting an offer. (either URL, phone, or email)",
} satisfies DocBusinessField;
