import type { DataSource, DocModel } from "../../types.js";
import { offerReadModelDoc } from "./offer_read.model.doc.js";
import applyDescEn from "./offer_write_docs/en/apply.description.md.js";
import applyDescFr from "./offer_write_docs/fr/apply.description.md.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png" },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const offerWriteModelDoc = {
  name: "Offre d'emploi",
  description: null,
  sources,
  _: {
    identifier: {
      ...offerReadModelDoc._.identifier,
      _: {
        partner_job_id: offerReadModelDoc._.identifier._.partner_job_id,
      },
    },
    contract: offerReadModelDoc._.contract,
    offer: {
      ...offerReadModelDoc._.offer,
      _: {
        access_conditions: offerReadModelDoc._.offer._.access_conditions,
        description: offerReadModelDoc._.offer._.description,
        desired_skills: offerReadModelDoc._.offer._.desired_skills,
        opening_count: offerReadModelDoc._.offer._.opening_count,
        publication: offerReadModelDoc._.offer._.publication,
        rome_codes: {
          description: { en: "ROME code(s) of the offer", fr: null },
          notes: {
            en: "If the published offer does not have a ROME code provided, we deduce the ROME codes from the job offer title.",
            fr: null,
          },
          _: {
            "[]": offerReadModelDoc._.offer._.rome_codes._["[]"],
          },
        },
        status: {
          description: offerReadModelDoc._.offer._.status.description,
          notes: {
            en: "When creating an offer, only active offers are accepted. However, during an update, it is possible to cancel or mark an offer as filled.",
            fr: null,
          },
          examples: ["Active", "Filled", "Cancelled"],
        },
        target_diploma: {
          ...offerReadModelDoc._.offer._.target_diploma,
          _: {
            european: offerReadModelDoc._.offer._.target_diploma._.european,
          },
        },
        title: offerReadModelDoc._.offer._.title,
        to_be_acquired_skills: offerReadModelDoc._.offer._.to_be_acquired_skills,
      },
    },
    workplace: {
      ...offerReadModelDoc._.workplace,
      _: {
        description: offerReadModelDoc._.workplace._.description,
        location: {
          ...offerReadModelDoc._.workplace._.location,
          _: {
            address: {
              description: { en: "Address of the job offer", fr: null },
              notes: {
                en: "In the case of job offer publication, a custom address can be provided; otherwise, the establishment's address will be used.\n\nThe geopoint field is derived from the address.",
                fr: null,
              },
              examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
            },
          },
        },
        name: offerReadModelDoc._.workplace._.name,
        siret: {
          ...offerReadModelDoc._.workplace._.siret,
          description: { en: "SIRET of the contract execution location", fr: null },
          notes: {
            en: "The information `brand` `legal_name` `size` `idcc` `opco` `naf` is automatically deduced from the SIRET.",
            fr: null,
          },
        },
        website: offerReadModelDoc._.workplace._.website,
      },
    },
    apply: {
      ...offerReadModelDoc._.apply,
      description: { en: applyDescEn, fr: applyDescFr },
      information: {
        en: "At least one application method must be provided when submitting an offer. (either URL, phone, or email)",
        fr: "Au moins une méthode de candidature doit être fournie lors du dépot d'offre. (soit url, phone, email)",
      },
      _: {
        email: {
          description: { en: "Recruiter's email adress", fr: null },
          examples: ["jean.dupuis@beta.gouv.fr"],
        },
        phone: offerReadModelDoc._.apply._.phone,
        url: {
          description: { en: "Redirect URL", fr: null },
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocModel;
