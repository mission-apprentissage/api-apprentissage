import type { DataSource, DocModel } from "../../../types.js";
import { offerReadModelDoc } from "../02_offer_read/offer_read.model.doc.js";
import identifierSection from "./01_identifier/index.js";
import offerSection from "./03_offer/index.js";
import workplaceSection from "./04_workplace/index.js";
import applySection from "./05_apply/index.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png", width: 171, height: 48 },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const offerWriteModelDoc = {
  name: "Offre d'emploi",
  sections: [identifierSection, offerReadModelDoc.sections[1], offerSection, workplaceSection, applySection],
  sources,
} as const satisfies DocModel;
