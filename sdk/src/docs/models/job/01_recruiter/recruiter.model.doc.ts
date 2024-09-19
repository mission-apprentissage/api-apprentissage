import type { DataSource, DocModel } from "../../../types.js";
import identifierSection from "./01_identifier/index.js";
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

export const recruiterModelDoc = {
  name: "Recruiter",
  sections: [identifierSection, workplaceSection, applySection],
  sources,
} as const satisfies DocModel;
