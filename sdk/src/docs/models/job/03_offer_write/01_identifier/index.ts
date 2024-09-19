import type { DocBusinessSection } from "../../../../types.js";
import { offerReadModelDoc } from "../../02_offer_read/offer_read.model.doc.js";

export default {
  name: "Identifier",
  fields: {
    identifier: offerReadModelDoc.sections[0].fields.identifier,
    ["identifier.job_partner_id"]: offerReadModelDoc.sections[0].fields["identifier.job_partner_id"],
  },
} as const satisfies DocBusinessSection;
