import type { DataSource, DocModel } from "../../../types.js";
import { recruiterModelDoc } from "../01_recruiter/recruiter.model.doc.js";
import identifierSection from "./01_identifier/index.js";
import contractSection from "./02_contract/index.js";
import offerSection from "./03_offer/index.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png", width: 171, height: 48 },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const offerReadModelDoc = {
  name: "Offre d'emploi",
  sections: [
    identifierSection,
    contractSection,
    offerSection,
    recruiterModelDoc.sections[1],
    recruiterModelDoc.sections[2],
  ],
  sources,
} as const satisfies DocModel;
