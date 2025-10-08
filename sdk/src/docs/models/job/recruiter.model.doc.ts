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
import type { DocTechnicalField } from "../../types.js";

export const recruiterModelDoc = {
  descriptions: [{ fr: "Recruteur", en: "Recruiter" }],
  properties: {
    identifier: {
      descriptions: [{ en: identifierDescEn, fr: identifierDescFr }],
      properties: {
        id: {
          descriptions: [{ fr: "Identifiant unique du recruteur", en: "Unique identifier of the recruiter" }],
          examples: ["6687165396d52b5e01b409545"],
        },
      },
    },
    workplace: {
      descriptions: [{ en: workplaceDescEn, fr: workplaceDescFr }],
      properties: {
        siret: {
          descriptions: [
            {
              en: "SIRET of the contract execution location or of the school if is_delegated = true",
              fr: "SIRET du lieu d'exécution du contrat ou du CFA si is_delegated = true",
            },
          ],
          examples: ["13002526500013"],
        },
        name: {
          descriptions: [
            {
              en: "Name of the establishment (brand name or, failing that, legal name) or school legal name if is_delegated = true",
              fr: "Nom de l'établissement (enseigne ou, à défaut, nom légal) ou nom légal du CFA si is_delegated = true",
            },
            {
              en: "In the case of publishing a job offer, it is possible to use a custom name; otherwise, it will take the value of the brand name, or failing that, the legal name.",
              fr: "Dans le cas de la publication d'une offre d'emploi, il est possible d'utiliser un nom personnalisé ; sinon, il prendra la valeur de l'enseigne, ou à défaut, du nom légal.",
            },
          ],
          examples: ["DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)"],
        },
        description: {
          descriptions: [
            {
              en: "Description of the employer and/or the department where the contract will be carried out.",
              fr: "Description de l'employeur et/ou du département où sera exécuté le contrat.",
            },
          ],
          examples: [
            "Service du Premier ministre, placé sous l’autorité du ministre de la Transformation et de la Fonction publiques, la direction interministérielle du numérique (DINUM) a pour mission d’élaborer la stratégie numérique de l’État et de piloter sa mise en œuvre. Notre objectif : un État plus efficace, plus simple et plus souverain grâce au numérique.",
          ],
        },
        brand: {
          descriptions: [{ en: "Brand name of the establishment", fr: "Enseigne de l'établissement" }],
          examples: ["Enseigne (todo)"],
        },
        legal_name: {
          descriptions: [
            {
              en: "Company legal name or school legal name if is_delegated = true",
              fr: "Raison sociale de l'entreprise ou raison sociale du CFA si is_delegated = true",
            },
          ],
        },
        size: {
          descriptions: [
            {
              en: "Company workforce range, in number of employees",
              fr: "Effectif de l'entreprise, en nombre d'employés",
            },
          ],
          examples: ["100-199"],
        },
        website: {
          descriptions: [{ en: "Company website", fr: "Site web de l'entreprise" }],
          examples: ["https://beta.gouv.fr/startups/"],
        },
        location: {
          descriptions: [{ en: workplaceLocationDescEn, fr: workplaceLocationDescFr }],
          properties: {
            address: {
              descriptions: [
                {
                  en: "Postal address of the job offer location or of the school if is_delegated = true.",
                  fr: "Adresse postale du lieu de l'offre d'emploi ou du CFA si is_delegated = true.",
                },
              ],
              examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
            },
            geopoint: {
              descriptions: [
                { en: "Geolocation linked to the address", fr: "Localisation géographique liée à l'adresse" },
                { en: "Derived from the address.", fr: "Déduite de l'adresse." },
              ],
            },
          },
        },
        domain: {
          descriptions: [{ en: workplaceDomainDescEn, fr: workplaceDomainDescFr }],
          properties: {
            idcc: {
              descriptions: [
                {
                  en: "Collective agreement number associated with the SIRET number",
                  fr: "Numéro de convention collective associé au SIRET",
                },
              ],
              examples: [1979],
            },
            naf: {
              descriptions: [
                {
                  en: "NAF (sector of activity) associated with the SIRET number",
                  fr: "Code NAF (secteur d'activité) associé au SIRET",
                },
              ],
              properties: {
                code: {
                  descriptions: [
                    {
                      en: "NAF code (sector of activity) associated with the SIRET number",
                      fr: "Code NAF (secteur d'activité) associé au SIRET",
                    },
                  ],
                  examples: ["8411Z"],
                },
                label: {
                  descriptions: [
                    {
                      en: "Label of the NAF code (sector of activity) associated with the SIRET number",
                      fr: "Libellé du code NAF (secteur d'activité) associé au SIRET",
                    },
                  ],
                  examples: ["Administration publique générale"],
                },
              },
            },
            opco: {
              descriptions: [
                {
                  en: "Competency Operator (OPCO) associated with the SIRET number",
                  fr: "OPérateur de Compétences (OPCO) associé au SIRET",
                },
              ],
              examples: ["OPCO 2i"],
            },
          },
        },
      },
    },
    apply: {
      descriptions: [{ en: applyDescEn, fr: applyDescFr }],
      properties: {
        recipient_id: {
          descriptions: [
            {
              en: "Identifier to use for applying to the job offer using /v3/jobs/apply route or to display the apply /postuler widget. If null applying is not available for this offer by apply_route nor by /postuler widget.",
              fr: "Identifiant à utiliser pour postuler à l'offre d'emploi via la route /v3/jobs/apply ou pour afficher le widget postuler. Si null, la candidature n'est pas disponible pour cette offre par la route apply_route ni par le widget /postuler.",
            },
          ],
        },
        phone: {
          descriptions: [
            {
              en: "Recruiter's phone number or School phone number if is_delegated is true",
              fr: "Numéro de téléphone du recruteur ou du CFA si is_delegated = true",
            },
            {
              en: "Only European phone numbers are allowed. There is also a check on the nature of the number: only mobile and landline phones are allowed.",
              fr: "Seuls les numéros de téléphone européens sont autorisés. Il y a également une vérification sur la nature du numéro : seuls les téléphones mobiles et fixes sont autorisés.",
            },
          ],
          examples: ["0199000000"],
        },
        url: {
          descriptions: [
            { en: "Redirect URL to the application form", fr: "URL de redirection vers le formulaire de candidature" },
          ],
          examples: [
            "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?display=list&page=fiche&type=matcha&itemId=664752a2ebe24062b758c641",
          ],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
