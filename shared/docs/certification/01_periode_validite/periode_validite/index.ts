import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };

export const periodeValiditeField: DocField = {
  name: "periode_validite",
  description,
  information,
  sample: "exemple : du 01.09.2021 au 31.08.2026",
  tags: ["periode_validite.debut", "periode_validite.fin"],
};
