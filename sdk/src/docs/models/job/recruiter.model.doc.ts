import applyDescEn from "../../metier/recherche-offre/en/apply.description.md.js";
import identifierDescEn from "../../metier/recherche-offre/en/identifier.description.md.js";
import workplaceDescEn from "../../metier/recherche-offre/en/workplace.description.md.js";
import workplaceDomainDescEn from "../../metier/recherche-offre/en/workplace.domain.description.md.js";
import workplaceLocationDescEn from "../../metier/recherche-offre/en/workplace.location.description.md.js";
import applyDescFr from "../../metier/recherche-offre/fr/apply.description.md.js";
import identifierDescFr from "../../metier/recherche-offre/fr/identifier.description.md.js";
import workplaceDescFr from "../../metier/recherche-offre/fr/workplace.description.md.js";
import workplaceDomainDescFr from "../../metier/recherche-offre/fr/workplace.domain.description.md.js";
import workplaceLocationDescFr from "../../metier/recherche-offre/fr/workplace.location.description.md.js";
import type { DocModel } from "../../types.js";

export const recruiterModelDoc = {
  description: { en: null, fr: "Recruteur" },
  _: {
    identifier: {
      descriptions: [{ en: identifierDescEn, fr: identifierDescFr }],
      _: {
        id: {
          descriptions: [{ en: "Partner responsible for the job offer.", fr: null }],
          examples: ["6687165396d52b5e01b409545"],
        },
      },
    },
    workplace: {
      descriptions: [{ en: workplaceDescEn, fr: workplaceDescFr }],
      _: {
        siret: {
          descriptions: [{ en: "SIRET of the contract execution location", fr: null }],
          examples: ["13002526500013"],
        },
        name: {
          descriptions: [
            { en: "Name of the establishment (brand name or, failing that, legal name)", fr: null },
            {
              en: "In the case of publishing a job offer, it is possible to use a custom name; otherwise, it will take the value of the brand name, or failing that, the legal name.",
              fr: null,
            },
          ],
          examples: ["DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)"],
        },
        description: {
          descriptions: [
            {
              en: "Description of the employer and/or the department where the contract will be carried out.",
              fr: null,
            },
          ],
          examples: [
            "Service du Premier ministre, placé sous l’autorité du ministre de la Transformation et de la Fonction publiques, la direction interministérielle du numérique (DINUM) a pour mission d’élaborer la stratégie numérique de l’État et de piloter sa mise en œuvre. Notre objectif : un État plus efficace, plus simple et plus souverain grâce au numérique.",
          ],
        },
        brand: {
          descriptions: [{ en: "Brand name of the establishment", fr: null }],
          examples: ["Enseigne (todo)"],
        },
        legal_name: {
          descriptions: [{ en: "Company legal name", fr: null }],
        },
        size: {
          descriptions: [{ en: "Company workforce range, in number of employees", fr: null }],
          examples: ["100-199"],
        },
        website: {
          descriptions: [{ en: "Company website", fr: null }],
          examples: ["https://beta.gouv.fr/startups/"],
        },
        location: {
          descriptions: [{ en: workplaceLocationDescEn, fr: workplaceLocationDescFr }],
          _: {
            address: {
              descriptions: [{ en: "Postal address of the job offer location.", fr: null }],
              examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
            },
            geopoint: {
              descriptions: [
                { en: "Geolocation linked to the address", fr: null },
                { en: "Derived from the address.", fr: null },
              ],
              _: {
                coordinates: {
                  descriptions: [{ en: "Coordinates of the geolocation linked to the address", fr: null }],
                  _: {
                    0: {
                      descriptions: [{ en: "Longitude", fr: null }],
                      examples: [48.850699],
                    },
                    1: {
                      descriptions: [{ en: "Latitude", fr: null }],
                      examples: [2.308628],
                    },
                  },
                },
                type: {
                  descriptions: [{ en: "GeoJSON type related to the geolocation linked to the address", fr: null }],
                  examples: ["Point"],
                },
              },
            },
          },
        },
        domain: {
          descriptions: [{ en: workplaceDomainDescEn, fr: workplaceDomainDescFr }],
          _: {
            idcc: {
              descriptions: [{ en: "Collective agreement number associated with the SIRET number", fr: null }],
              examples: [1979],
            },
            naf: {
              descriptions: [{ en: "NAF (sector of activity) associated with the SIRET number", fr: null }],
              _: {
                code: {
                  descriptions: [{ en: "NAF code (sector of activity) associated with the SIRET number", fr: null }],
                  examples: ["8411Z"],
                },
                label: {
                  descriptions: [
                    {
                      en: "Label of the NAF code (sector of activity) associated with the SIRET number",
                      fr: null,
                    },
                  ],
                  examples: ["Administration publique générale"],
                },
              },
            },
            opco: {
              descriptions: [{ en: "Competency Operator (OPCO) associated with the SIRET number", fr: null }],
              examples: ["OPCO 2i"],
            },
          },
        },
      },
    },
    apply: {
      descriptions: [{ en: applyDescEn, fr: applyDescFr }],
      _: {
        recipient_id: {
          descriptions: [
            {
              en: "Identifier to use for applying to the job offer using /v3/jobs/apply route",
              fr: null,
            },
          ],
        },
        phone: {
          descriptions: [
            { en: "Recruiter's phone number", fr: null },
            {
              en: "Only European phone numbers are allowed. There is also a check on the nature of the number: only mobile and landline phones are allowed.",
              fr: null,
            },
          ],
          examples: ["0199000000"],
        },
        url: {
          descriptions: [{ en: "Redirect URL to the application form", fr: null }],
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocModel;
