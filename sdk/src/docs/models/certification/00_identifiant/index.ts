import type { DocBusinessSection } from "../../../types.js";
import identifiantCfd from "./identifiant.cfd/index.js";
import identifiantRncp from "./identifiant.rncp/index.js";
import identifiantRncpAnterieur2019 from "./identifiant.rncp_anterieur_2019/index.js";
import identifiantField from "./identifiant/index.js";

export default {
  name: "Identifiant",
  fields: {
    identifiant: identifiantField,
    "identifiant.cfd": identifiantCfd,
    "identifiant.rncp": identifiantRncp,
    "identiant.rncp_anterieur_2019": identifiantRncpAnterieur2019,
  },
} as const satisfies DocBusinessSection;
