import type { DocBusinessSection } from "../../../../types.js";
import { offerReadModelDoc } from "../../02_offer_read/offer_read.model.doc.js";

export default {
  name: "Offer",
  fields: {
    offer: offerReadModelDoc.sections[2].fields.offer,
    ["offer.access_conditions"]: offerReadModelDoc.sections[2].fields["offer.access_conditions"],
    ["offer.access_conditions[]"]: offerReadModelDoc.sections[2].fields["offer.access_conditions[]"],
    ["offer.description"]: offerReadModelDoc.sections[2].fields["offer.description"],
    ["offer.desired_skills"]: offerReadModelDoc.sections[2].fields["offer.desired_skills"],
    ["offer.desired_skills[]"]: offerReadModelDoc.sections[2].fields["offer.desired_skills[]"],
    ["offer.opening_count"]: offerReadModelDoc.sections[2].fields["offer.opening_count"],
    ["offer.publication"]: offerReadModelDoc.sections[2].fields["offer.publication"],
    ["offer.publication.creation"]: offerReadModelDoc.sections[2].fields["offer.publication.creation"],
    ["offer.publication.expiration"]: offerReadModelDoc.sections[2].fields["offer.publication.expiration"],
    ["offer.rome_codes"]: {
      type: "technical",
      description: "ROME code(s) of the offer",
      notes:
        "If the published offer does not have a ROME code provided, we deduce the ROME codes from the job offer title.",
    },
    ["offer.rome_codes[]"]: offerReadModelDoc.sections[2].fields["offer.rome_codes[]"],
    ["offer.status"]: {
      type: "technical",
      description: [
        "The status of the offer (life cycle):",
        "- Active: The offer is available on the platform, and applications are open.",
        "- Filled: The offer has been filled and is no longer available.",
        "- Cancelled: The offer has been canceled and is no longer available.",
      ].join("\n\n"),
      notes:
        "When creating an offer, only active offers are accepted. However, during an update, it is possible to cancel or mark an offer as filled.",
      examples: ["Active", "Filled", "Cancelled"],
    },
    ["offer.target_diploma"]: offerReadModelDoc.sections[2].fields["offer.target_diploma"],
    ["offer.target_diploma.european"]: offerReadModelDoc.sections[2].fields["offer.target_diploma.european"],
    ["offer.title"]: offerReadModelDoc.sections[2].fields["offer.title"],
    ["offer.to_be_acquired_skills"]: offerReadModelDoc.sections[2].fields["offer.to_be_acquired_skills"],
    ["offer.to_be_acquired_skills[]"]: offerReadModelDoc.sections[2].fields["offer.to_be_acquired_skills[]"],
  },
} as const satisfies DocBusinessSection;
