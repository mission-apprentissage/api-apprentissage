import { DocField } from "../../../types.js";
import description from "./description.md.js";
import information from "./information.md.js";
import tip from "./tip.md.js";

export const identifiantField: DocField = {
  name: "identifiant",
  description,
  information,
  sample: "exemple : La certification correspond au couple CFD 50022137 - RNCP37537",
  tags: [".cfd", ".rncp", ".rncp_anterieur_2019"],
  tip: {
    title: "structure des codes CFD et RNCP",
    content: tip,
  },
};
