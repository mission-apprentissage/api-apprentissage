import type { DataSource, DocModel } from "../../types.js";
import applyDesc from "./recruiter_docs/apply.description.md.js";
import identifierDesc from "./recruiter_docs/identifier.description.md.js";
import workplaceDesc from "./recruiter_docs/workplace.description.md.js";
import workplaceDomainDesc from "./recruiter_docs/workplace.domain.description.md.js";
import workplaceLocationDesc from "./recruiter_docs/workplace.location.description.md.js";

const sources: DataSource[] = [
  {
    name: "La bonne alternance",
    logo: { href: "/asset/logo/la_bonne_alternance.png", width: 171, height: 48 },
    providers: ["La bonne alternance"],
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
];

export const recruiterModelDoc = {
  name: "Recruiter",
  description: null,
  sources,
  _: {
    identifier: {
      metier: true,
      section: "Identifier",
      description: identifierDesc,
      tags: [],
      _: {
        id: {
          description: "Partner responsible for the job offer.",
          examples: ["6687165396d52b5e01b409545"],
        },
      },
    },
    workplace: {
      metier: true,
      section: "Workplace",
      description: workplaceDesc,
      tags: [],
      _: {
        siret: {
          description: "SIRET of the contract execution location",
          examples: ["13002526500013"],
        },
        name: {
          description: "Name of the establishment (brand name or, failing that, legal name)",
          notes:
            "In the case of publishing a job offer, it is possible to use a custom name; otherwise, it will take the value of the brand name, or failing that, the legal name.",
          examples: ["DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)"],
        },
        description: {
          description: "Description of the employer and/or the department where the contract will be carried out.",
          examples: [
            "Service du Premier ministre, placé sous l’autorité du ministre de la Transformation et de la Fonction publiques, la direction interministérielle du numérique (DINUM) a pour mission d’élaborer la stratégie numérique de l’État et de piloter sa mise en œuvre. Notre objectif : un État plus efficace, plus simple et plus souverain grâce au numérique.",
          ],
        },
        brand: {
          description: "Brand name of the establishment",
          examples: ["Enseigne (todo)"],
        },
        legal_name: {
          description: "Company legal name",
        },
        size: {
          description: "Company workforce range, in number of employees",
          examples: ["100-199"],
        },
        website: {
          description: "Company website",
          examples: ["https://beta.gouv.fr/startups/"],
        },
        location: {
          section: "Workplace",
          metier: true,
          description: workplaceLocationDesc,
          tags: [],
          _: {
            address: {
              description: "Postal address of the job offer location.",
              examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
            },
            geopoint: {
              description: "Geolocation linked to the address",
              notes: "Derived from the address.",
              _: {
                coordinates: {
                  description: "Coordinates of the geolocation linked to the address",
                  _: {
                    0: {
                      description: "Longitude",
                      examples: [48.850699],
                    },
                    1: {
                      description: "Latitude",
                      examples: [2.308628],
                    },
                  },
                },
                type: {
                  description: "GeoJSON type related to the geolocation linked to the address",
                  examples: ["Point"],
                },
              },
            },
          },
        },
        domain: {
          section: "Workplace",
          metier: true,
          description: workplaceDomainDesc,
          tags: [],
          _: {
            idcc: {
              description: "Collective agreement number associated with the SIRET number",
              examples: [1979],
            },
            naf: {
              description: "NAF (sector of activity) associated with the SIRET number",
              _: {
                code: {
                  description: "NAF code (sector of activity) associated with the SIRET number",
                  examples: ["8411Z"],
                },
                label: {
                  description: "Label of the NAF code (sector of activity) associated with the SIRET number",
                  examples: ["Administration publique générale"],
                },
              },
            },
            opco: {
              description: "Competency Operator (OPCO) associated with the SIRET number",
              examples: ["OPCO 2i"],
            },
          },
        },
      },
    },
    apply: {
      section: "Apply",
      metier: true,
      description: applyDesc,
      tags: [],
      _: {
        phone: {
          description: "Recruiter's phone number",
          notes:
            "Only European phone numbers are allowed. There is also a check on the nature of the number: only mobile and landline phones are allowed.",
          examples: ["0199000000"],
        },
        url: {
          description: "Redirect URL to the application form",
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocModel;
