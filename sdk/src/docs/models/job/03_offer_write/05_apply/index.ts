import type { DocBusinessSection } from "../../../../types.js";
import { offerReadModelDoc } from "../../02_offer_read/offer_read.model.doc.js";
import apply from "./apply/index.js";

export default {
  name: "Apply",
  fields: {
    apply,
    ["apply.email"]: {
      description: "Recruiter's email adress",
      examples: ["jean.dupuis@beta.gouv.fr"],
    },
    ["apply.phone"]: offerReadModelDoc.sections[4].fields["apply.phone"],
    ["apply.url"]: {
      description: "Redirect URL",
      examples: [
        "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
      ],
    },
  },
} as const satisfies DocBusinessSection;
