import type { DocBusinessSection } from "../../../../types.js";
import { offerReadModelDoc } from "../../02_offer_read/offer_read.model.doc.js";

export default {
  name: "Workplace",
  fields: {
    workplace: offerReadModelDoc.sections[3].fields["workplace"],
    ["workplace.description"]: offerReadModelDoc.sections[3].fields["workplace.description"],
    ["workplace.location"]: offerReadModelDoc.sections[3].fields["workplace.location"],
    ["workplace.location.address"]: {
      description: "Address of the job offer",
      notes:
        "In the case of job offer publication, a custom address can be provided; otherwise, the establishment's address will be used.\n\nThe geopoint field is derived from the address.",
      examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
    },
    ["workplace.name"]: offerReadModelDoc.sections[3].fields["workplace.name"],
    ["workplace.siret"]: {
      description: "SIRET of the contract execution location",
      notes: "The information `brand` `legal_name` `size` `idcc` `opco` `naf` is automatically deduced from the SIRET.",
      examples: ["13002526500013"],
    },
    ["workplace.website"]: offerReadModelDoc.sections[3].fields["workplace.website"],
  },
} as const satisfies DocBusinessSection;
