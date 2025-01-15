import type { DocTechnicalField } from "../../types.js";
import { offerReadModelDoc } from "./offer_read.model.doc.js";
import applyDescEn from "./offer_write_docs/en/apply.description.md.js";
import applyDescFr from "./offer_write_docs/fr/apply.description.md.js";

export const offerWriteModelDoc = {
  descriptions: [{ en: null, fr: "Offre d'emploi" }],
  properties: {
    contract: offerReadModelDoc.properties.contract,
    offer: {
      ...offerReadModelDoc.properties.offer,
      properties: {
        access_conditions: offerReadModelDoc.properties.offer.properties.access_conditions,
        description: offerReadModelDoc.properties.offer.properties.description,
        desired_skills: offerReadModelDoc.properties.offer.properties.desired_skills,
        opening_count: offerReadModelDoc.properties.offer.properties.opening_count,
        publication: offerReadModelDoc.properties.offer.properties.publication,
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
          items: offerReadModelDoc.properties.offer.properties.rome_codes.items,
        },
        status: {
          descriptions: [
            ...offerReadModelDoc.properties.offer.properties.status.descriptions,
            {
              en: "When creating an offer, only active offers are accepted. However, during an update, it is possible to cancel or mark an offer as filled.",
              fr: null,
            },
          ],
          examples: ["Active", "Filled", "Cancelled"],
        },
        target_diploma: {
          ...offerReadModelDoc.properties.offer.properties.target_diploma,
          properties: {
            european: offerReadModelDoc.properties.offer.properties.target_diploma.properties.european,
          },
        },
        title: offerReadModelDoc.properties.offer.properties.title,
        to_be_acquired_skills: offerReadModelDoc.properties.offer.properties.to_be_acquired_skills,
      },
    },
    workplace: {
      ...offerReadModelDoc.properties.workplace,
      properties: {
        description: offerReadModelDoc.properties.workplace.properties.description,
        location: {
          ...offerReadModelDoc.properties.workplace.properties.location,
          properties: {
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
        name: offerReadModelDoc.properties.workplace.properties.name,
        siret: {
          ...offerReadModelDoc.properties.workplace.properties.siret,
          descriptions: [
            { en: "SIRET of the contract execution location", fr: null },
            {
              en: "The information `brand` `legal_name` `size` `idcc` `opco` `naf` is automatically deduced from the SIRET.",
              fr: null,
            },
          ],
        },
        website: offerReadModelDoc.properties.workplace.properties.website,
      },
    },
    apply: {
      ...offerReadModelDoc.properties.apply,
      descriptions: [{ en: applyDescEn, fr: applyDescFr }],
      properties: {
        email: {
          descriptions: [{ en: "Recruiter's email adress", fr: null }],
          examples: ["jean.dupuis@beta.gouv.fr"],
        },
        phone: offerReadModelDoc.properties.apply.properties.phone,
        url: {
          descriptions: [{ en: "Redirect URL", fr: null }],
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
