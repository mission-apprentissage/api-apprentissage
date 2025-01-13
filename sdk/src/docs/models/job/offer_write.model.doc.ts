import type { DocModel } from "../../types.js";
import { offerReadModelDoc } from "./offer_read.model.doc.js";
import applyDescEn from "./offer_write_docs/en/apply.description.md.js";
import applyDescFr from "./offer_write_docs/fr/apply.description.md.js";

export const offerWriteModelDoc = {
  description: { en: null, fr: "Offre d'emploi" },
  _: {
    contract: offerReadModelDoc._.contract,
    offer: {
      ...offerReadModelDoc._.offer,
      _: {
        access_conditions: offerReadModelDoc._.offer._.access_conditions,
        description: offerReadModelDoc._.offer._.description,
        desired_skills: offerReadModelDoc._.offer._.desired_skills,
        opening_count: offerReadModelDoc._.offer._.opening_count,
        publication: offerReadModelDoc._.offer._.publication,
        multicast: {
          descriptions: [
            {
              fr: "Si l'offre peut être diffusé sur l'ensemble des plateformes partenaires",
              en: "If the offer can be broadcast on all partner platforms",
            },
          ],
        },
        origin: {
          descriptions: [
            { fr: "Origine de l'offre provenant d'un aggregateur", en: "Origin of the offer from an aggregator" },
          ],
        },
        rome_codes: {
          descriptions: [
            { en: "ROME code(s) of the offer", fr: null },
            {
              en: "If the published offer does not have a ROME code provided, we deduce the ROME codes from the job offer title.",
              fr: null,
            },
          ],
          _: {
            "[]": offerReadModelDoc._.offer._.rome_codes._["[]"],
          },
        },
        status: {
          descriptions: [
            ...offerReadModelDoc._.offer._.status.descriptions,
            {
              en: "When creating an offer, only active offers are accepted. However, during an update, it is possible to cancel or mark an offer as filled.",
              fr: null,
            },
          ],
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
              descriptions: [
                { en: "Address of the job offer", fr: null },
                {
                  en: "In the case of job offer publication, a custom address can be provided; otherwise, the establishment's address will be used.\n\nThe geopoint field is derived from the address.",
                  fr: null,
                },
              ],
              examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
            },
          },
        },
        name: offerReadModelDoc._.workplace._.name,
        siret: {
          ...offerReadModelDoc._.workplace._.siret,
          descriptions: [
            { en: "SIRET of the contract execution location", fr: null },
            {
              en: "The information `brand` `legal_name` `size` `idcc` `opco` `naf` is automatically deduced from the SIRET.",
              fr: null,
            },
          ],
        },
        website: offerReadModelDoc._.workplace._.website,
      },
    },
    apply: {
      ...offerReadModelDoc._.apply,
      descriptions: [{ en: applyDescEn, fr: applyDescFr }],
      _: {
        email: {
          descriptions: [{ en: "Recruiter's email adress", fr: null }],
          examples: ["jean.dupuis@beta.gouv.fr"],
        },
        phone: offerReadModelDoc._.apply._.phone,
        url: {
          descriptions: [{ en: "Redirect URL", fr: null }],
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocModel;
