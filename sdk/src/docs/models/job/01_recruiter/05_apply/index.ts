import type { DocBusinessSection } from "../../../../types.js";
import apply from "./apply/index.js";

export default {
  name: "Apply",
  fields: {
    apply,
    ["apply.phone"]: {
      type: "technical",
      description: "Recruiter's phone number",
      notes:
        "Only European phone numbers are allowed. There is also a check on the nature of the number: only mobile and landline phones are allowed.",
      examples: ["0199000000"],
    },
    ["apply.url"]: {
      type: "technical",
      description: "Redirect URL to the application form",
      examples: [
        "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
      ],
    },
  },
} as const satisfies DocBusinessSection;
