import type { DocBusinessSection } from "../../../../types.js";
import { recruiterModelDoc } from "../../01_recruiter/recruiter.model.doc.js";

export default {
  name: "Identifier",
  fields: {
    identifier: recruiterModelDoc.sections[0].fields.identifier,
    ["identifier.id"]: {
      type: "technical",
      description: "Identifier of the job offer in the La bonne alternance database.",
      examples: ["6687165396d52b5e01b409545 "],
      notes:
        "France Travail offers are not stored in the La bonne alternance database but are retrieved on the fly. They do not have an identifier in the database.",
    },
    ["identifier.job_partner_id"]: {
      type: "technical",
      description: "Offer identifier within the partner's information system.",
      examples: ["b16a546a-e61f-4028-b5a3-1a7bbfaa4e3d"],
    },
    ["identifier.partner_label"]: {
      type: "technical",
      description: "Partner originating the job offer.",
      notes: 'In the case of La Bonne Alternance, the partner_label is: "La bonne alternance".',
      examples: ["France Travail", "La bonne alternance"],
    },
  },
} as const satisfies DocBusinessSection;
