import type { DocTechnicalField } from "../../types.js";

export const organismeModelDoc = {
  descriptions: null,
  properties: {
    contacts: {
      descriptions: [{ fr: "Contacts de l'organisme", en: "Organism's contacts" }],
      items: {
        descriptions: null,
        properties: {
          confirmation_referentiel: {
            descriptions: [
              {
                fr: 'Indique si le contact a un statut "confirmé" sur le référentiel des organismes de formation',
                en: 'Indicates if the contact has a "confirmed" status on the training organizations repository',
              },
            ],
          },
          email: {
            descriptions: [{ fr: "Email du contact", en: "Contact's email" }],
          },
          sources: {
            descriptions: [{ fr: "Sources du contact", en: "Contact's sources" }],
            items: {
              descriptions: null,
            },
          },
        },
      },
    },
    etablissement: {
      descriptions: [{ fr: "Etablissement de l'organisme", en: "Organism's establishment" }],
      properties: {
        adresse: {
          descriptions: [{ fr: "Adresse de l'établissement", en: "Establishment's address" }],
          oneOf: [{ descriptions: null }, { descriptions: null }],
        },
        creation: {
          descriptions: [{ fr: "Date de création de l'établissement", en: "Establishment's creation date" }],
        },
        enseigne: {
          descriptions: [{ fr: "Enseigne de l'établissement", en: "Establishment's brand" }],
        },
        fermeture: {
          descriptions: [{ fr: "Date de fermeture de l'établissement", en: "Establishment's closing date" }],
        },
        ouvert: {
          descriptions: [{ fr: "Etablissement ouvert", en: "Establishment open" }],
        },
        siret: {
          descriptions: [{ fr: "Numéro SIRET de l'établissement", en: "Establishment's SIRET number" }],
        },
      },
    },
    identifiant: {
      descriptions: [{ fr: "Identifiant de l'organisme", en: "Organism's identifier" }],
      properties: {
        siret: {
          descriptions: [{ fr: "Numéro SIRET de l'organisme", en: "Organism's SIRET number" }],
        },
        uai: {
          descriptions: [{ fr: "Numéro UAI de l'organisme", en: "Organism's UAI number" }],
        },
      },
    },
    renseignements_specifiques: {
      descriptions: [{ fr: "Renseignements spécifiques", en: "Specific information" }],
      properties: {
        numero_activite: {
          descriptions: [{ fr: "Numéro d'activité", en: "Activity number" }],
        },
        qualiopi: {
          descriptions: [{ fr: "Qualiopi", en: "Qualiopi" }],
        },
      },
    },
    statut: {
      descriptions: [{ fr: "Statut de l'organisme", en: "Organism's status" }],
      properties: {
        referentiel: {
          descriptions: [
            {
              fr: "Statut de l'organisme dans le réferentiel des organismes en apprentissage",
              en: "Organism's status in the training organizations repository",
            },
          ],
        },
      },
    },
    unite_legale: {
      descriptions: [{ fr: "Unité légale de l'organisme", en: "Organism's legal unit" }],
      properties: {
        actif: {
          descriptions: [{ fr: "Unité légale active", en: "Legal unit active" }],
        },
        cessation: {
          descriptions: [{ fr: "Date de cessation de l'unité légale", en: "Legal unit cessation date" }],
        },
        creation: {
          descriptions: [{ fr: "Date de création de l'unité légale", en: "Legal unit creation date" }],
        },
        raison_sociale: {
          descriptions: [{ fr: "Raison sociale de l'unité légale", en: "Legal unit name" }],
        },
        siren: {
          descriptions: [{ fr: "Numéro SIREN de l'unité légale", en: "Legal unit's SIREN number" }],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
