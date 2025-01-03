import type { DataSource, DocModel } from "../../types.js";
import applyDescEn from "./recruiter_docs/en/apply.description.md.js";
import identifierDescEn from "./recruiter_docs/en/identifier.description.md.js";
import workplaceDescEn from "./recruiter_docs/en/workplace.description.md.js";
import workplaceDomainDescEn from "./recruiter_docs/en/workplace.domain.description.md.js";
import workplaceLocationDescEn from "./recruiter_docs/en/workplace.location.description.md.js";
import applyDescFr from "./recruiter_docs/fr/apply.description.md.js";
import identifierDescFr from "./recruiter_docs/fr/identifier.description.md.js";
import workplaceDescFr from "./recruiter_docs/fr/workplace.description.md.js";
import workplaceDomainDescFr from "./recruiter_docs/fr/workplace.domain.description.md.js";
import workplaceLocationDescFr from "./recruiter_docs/fr/workplace.location.description.md.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png" },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const recruiterModelDoc = {
  name: "Recruiter",
  description: { en: null, fr: "Recruteur" },
  sources,
  sections: {
    identifier: {
      name: { en: "Identifier", fr: null },
      _: {
        identifier: {
          metier: true,
          description: { en: identifierDescEn, fr: identifierDescFr },
          tags: [],
          _: {
            id: {
              description: { en: "Partner responsible for the job offer.", fr: null },
              examples: ["6687165396d52b5e01b409545"],
            },
          },
        },
      },
    },
    workplace: {
      name: { en: "Workplace", fr: null },
      _: {
        workplace: {
          metier: true,
          description: { en: workplaceDescEn, fr: workplaceDescFr },
          tags: [],
          _: {
            siret: {
              description: { en: "SIRET of the contract execution location", fr: null },
              examples: ["13002526500013"],
            },
            name: {
              description: { en: "Name of the establishment (brand name or, failing that, legal name)", fr: null },
              notes: {
                en: "In the case of publishing a job offer, it is possible to use a custom name; otherwise, it will take the value of the brand name, or failing that, the legal name.",
                fr: null,
              },
              examples: ["DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)"],
            },
            description: {
              description: {
                en: "Description of the employer and/or the department where the contract will be carried out.",
                fr: null,
              },
              examples: [
                "Service du Premier ministre, placé sous l’autorité du ministre de la Transformation et de la Fonction publiques, la direction interministérielle du numérique (DINUM) a pour mission d’élaborer la stratégie numérique de l’État et de piloter sa mise en œuvre. Notre objectif : un État plus efficace, plus simple et plus souverain grâce au numérique.",
              ],
            },
            brand: {
              description: { en: "Brand name of the establishment", fr: null },
              examples: ["Enseigne (todo)"],
            },
            legal_name: {
              description: { en: "Company legal name", fr: null },
            },
            size: {
              description: { en: "Company workforce range, in number of employees", fr: null },
              examples: ["100-199"],
            },
            website: {
              description: { en: "Company website", fr: null },
              examples: ["https://beta.gouv.fr/startups/"],
            },
            location: {
              metier: true,
              description: { en: workplaceLocationDescEn, fr: workplaceLocationDescFr },
              tags: [],
              _: {
                address: {
                  description: { en: "Postal address of the job offer location.", fr: null },
                  examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
                },
                geopoint: {
                  description: { en: "Geolocation linked to the address", fr: null },
                  notes: { en: "Derived from the address.", fr: null },
                  _: {
                    coordinates: {
                      description: { en: "Coordinates of the geolocation linked to the address", fr: null },
                      _: {
                        0: {
                          description: { en: "Longitude", fr: null },
                          examples: [48.850699],
                        },
                        1: {
                          description: { en: "Latitude", fr: null },
                          examples: [2.308628],
                        },
                      },
                    },
                    type: {
                      description: { en: "GeoJSON type related to the geolocation linked to the address", fr: null },
                      examples: ["Point"],
                    },
                  },
                },
              },
            },
            domain: {
              metier: true,
              description: { en: workplaceDomainDescEn, fr: workplaceDomainDescFr },
              tags: [],
              _: {
                idcc: {
                  description: { en: "Collective agreement number associated with the SIRET number", fr: null },
                  examples: [1979],
                },
                naf: {
                  description: { en: "NAF (sector of activity) associated with the SIRET number", fr: null },
                  _: {
                    code: {
                      description: { en: "NAF code (sector of activity) associated with the SIRET number", fr: null },
                      examples: ["8411Z"],
                    },
                    label: {
                      description: {
                        en: "Label of the NAF code (sector of activity) associated with the SIRET number",
                        fr: null,
                      },
                      examples: ["Administration publique générale"],
                    },
                  },
                },
                opco: {
                  description: { en: "Competency Operator (OPCO) associated with the SIRET number", fr: null },
                  examples: ["OPCO 2i"],
                },
              },
            },
          },
        },
      },
    },
    apply: {
      name: { en: "Apply", fr: null },
      _: {
        apply: {
          metier: true,
          description: { en: applyDescEn, fr: applyDescFr },
          tags: [],
          _: {
            recipient_id: {
              description: {
                en: "Identifier to use for applying to the job offer using /v3/jobs/apply route",
                fr: null,
              },
            },
            phone: {
              description: { en: "Recruiter's phone number", fr: null },
              notes: {
                en: "Only European phone numbers are allowed. There is also a check on the nature of the number: only mobile and landline phones are allowed.",
                fr: null,
              },
              examples: ["0199000000"],
            },
            url: {
              description: { en: "Redirect URL to the application form", fr: null },
              examples: [
                "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
              ],
            },
          },
        },
      },
    },
  },
} as const satisfies DocModel;
