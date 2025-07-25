import type { DocTechnicalField } from "../../types.js";
import { offerReadModelDoc } from "./offer_read.model.doc.js";
import applyDescEn from "./offer_write_docs/en/apply.description.md.js";
import offerDescriptionEn from "./offer_write_docs/en/offer.description.md.js";
import applyDescFr from "./offer_write_docs/fr/apply.description.md.js";
import offerDescriptionFr from "./offer_write_docs/fr/offer.description.md.js";

export const offerWriteModelDoc = {
  descriptions: [{ fr: "Offre d'emploi", en: "Job offer" }],
  properties: {
    contract: offerReadModelDoc.properties.contract,
    offer: {
      ...offerReadModelDoc.properties.offer,
      properties: {
        access_conditions: offerReadModelDoc.properties.offer.properties.access_conditions,
        description: {
          descriptions: [{ fr: offerDescriptionFr, en: offerDescriptionEn }],
          examples: offerReadModelDoc.properties.offer.properties.description.examples,
        },
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
            { en: "ROME code(s) of the offer", fr: "Code(s) ROME de l'offre" },
            {
              en: "If the published offer does not have a ROME code provided, we deduce the ROME codes from the job offer title.",
              fr: "Si l'offre publiée ne dispose pas de code ROME fourni, nous déduisons les codes ROME à partir du titre de l'offre d'emploi.",
            },
          ],
          items: offerReadModelDoc.properties.offer.properties.rome_codes.items,
        },
        status: {
          descriptions: [
            ...offerReadModelDoc.properties.offer.properties.status.descriptions,
            {
              en: "When creating an offer, only active offers are accepted. However, during an update, it is possible to cancel or mark an offer as filled.",
              fr: "Lors de la création d'une offre, seules les offres actives sont acceptées. Cependant, lors d'une mise à jour, il est possible d'annuler ou de marquer une offre comme remplie.",
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
        description: {
          descriptions: [{ fr: offerDescriptionFr, en: offerDescriptionEn }],
          examples: offerReadModelDoc.properties.workplace.properties.description.examples,
        },
        location: {
          ...offerReadModelDoc.properties.workplace.properties.location,
          properties: {
            address: {
              descriptions: [
                { en: "Address of the job offer", fr: "Adresse de l'offre d'emploi" },
                {
                  en: "In the case of job offer publication, a custom address can be provided; otherwise, the establishment's address will be used.\n\nThe geopoint field is derived from the address.",
                  fr: "Dans le cas de la publication d'une offre d'emploi, une adresse personnalisée peut être fournie ; sinon, l'adresse de l'établissement sera utilisée.\n\nLe champ geopoint est dérivé de l'adresse.",
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
            { en: "SIRET of the contract execution location", fr: "SIRET du lieu d'exécution du contrat" },
            {
              en: "The information `brand` `legal_name` `size` `idcc` `opco` `naf` is automatically deduced from the SIRET.",
              fr: "La marque, le nom légal, la taille, l'IDCC, l'OPCO et le NAF sont automatiquement déduits du SIRET.",
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
          descriptions: [{ en: "Recruiter's email adress", fr: "Adresse email du recruteur" }],
          examples: ["jean.dupuis@beta.gouv.fr"],
        },
        phone: offerReadModelDoc.properties.apply.properties.phone,
        url: {
          descriptions: [{ en: "Redirect URL", fr: "URL de redirection" }],
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
