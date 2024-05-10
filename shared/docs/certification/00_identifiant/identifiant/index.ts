import { DocField } from "../../../types";
import description from "./description.md?raw" assert { type: "text" };
import information from "./information.md?raw" assert { type: "text" };
import tip from "./tip.md?raw" assert { type: "text" };

export const identifiantField: DocField = {
  name: "identifiant",
  description,
  information,
  sample: "exemple : La certification correspond au couple CFD 50022137 - RNCP37537",
  tags: ["identifiant.cfd", "identifiant.rncp", "identifiant.rncp_anterieur_2019"],
  tip: {
    title: "structure des codes CFD et RNCP",
    content: tip,
  },
};
