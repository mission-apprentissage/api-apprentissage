import { organismeModelDoc } from "../../models/organisme/organisme.model.doc.js";
import type { DocRoute, DocTechnicalField } from "../../types.js";

const resultItemDoc: DocTechnicalField = {
  descriptions: null,
  properties: {
    correspondances: {
      descriptions: [
        {
          fr: "Informations sur les correspondances avec les critères de recherche",
          en: "Information on matches with search criteria",
        },
      ],
      properties: {
        siret: {
          descriptions: [
            {
              fr: "Informations sur les correspondances SIRET",
              en: "Information on SIRET matches",
            },
          ],
          anyOf: [
            {
              descriptions: null,
              properties: {
                lui_meme: {
                  descriptions: [
                    {
                      fr: "Le SIRET de l'organisme correspond exactement à celui recherché",
                      en: "The SIRET of the organism exactly matches the one searched",
                    },
                  ],
                },
                son_formateur: {
                  descriptions: [
                    {
                      fr: "Le SIRET d'un de ces formateurs correspond à celui recherché",
                      en: "The SIRET of one of its trainers matches the one searched",
                    },
                  ],
                },
                son_responsable: {
                  descriptions: [
                    {
                      fr: "Le SIRET du responsable de l'organisme correspond à celui recherché",
                      en: "The SIRET of the organism's manager matches the one searched",
                    },
                  ],
                },
              },
            },
            {
              descriptions: [
                {
                  fr: "Aucune recherche par SIRET n'a été effectuée",
                  en: "No search by SIRET was performed",
                },
              ],
            },
          ],
        },
        uai: {
          descriptions: [
            {
              fr: "Informations sur les correspondances UAI",
              en: "Information on UAI matches",
            },
          ],
          anyOf: [
            {
              descriptions: null,
              properties: {
                lui_meme: {
                  descriptions: [
                    {
                      fr: "L'UAI de l'organisme correspond exactement à celui recherché",
                      en: "The UAI of the organism exactly matches the one searched",
                    },
                  ],
                },
                son_lieu: {
                  descriptions: [
                    {
                      fr: "L'UAI d'un de ces lieux correspond à celui recherché",
                      en: "The UAI of one of its locations matches the one searched",
                    },
                  ],
                },
              },
            },
            {
              descriptions: [
                {
                  fr: "Aucune recherche par UAI n'a été effectuée",
                  en: "No search by UAI was performed",
                },
              ],
            },
          ],
        },
      },
    },
    organisme: {
      descriptions: [
        {
          fr: "Référence de l'organisme",
          en: "Reference of the organism",
        },
      ],
      properties: {
        identifiant: organismeModelDoc.properties.identifiant,
      },
    },
    status: {
      descriptions: [
        {
          fr: "Statut référencementiel de l'organisme",
          en: "Organism's referential status",
        },
      ],
      properties: {
        declaration_catalogue: {
          descriptions: [
            {
              fr: 'Indique si l\'organisme est présent dans le "Catalogue des formations en apprentissage"',
              en: 'Indicates if the organism is present in the "Catalogue des formations en apprentissage"',
            },
          ],
        },
        ouvert: {
          descriptions: [
            {
              fr: "Indique si l'organisme est ouvert (état administratif actif)",
              en: "Indicates if the organism is open (administrative status active)",
            },
          ],
        },
        validation_uai: {
          descriptions: [
            {
              fr: "Indique si l'UAI de l'organisme est validée par le Référentiel des Organismes de Formation",
              en: 'Indicates if the UAI of the organism is validated by the "Référentiel des Organismes de Formation"',
            },
          ],
        },
      },
    },
  },
};

export const searchOrganismeRouteDoc = {
  summary: {
    fr: "Recherche d'organismes par UAI et/ou SIRET",
    en: "Search for organizations by UAI and/or SIRET",
  },
  description: {
    fr: "Récupère la liste des organismes, filtrée par UAI et/ou SIRET fournis",
    en: "Retrieves a list of organizations, filtered by the provided UAI and/or SIRET",
  },
  parameters: {
    uai: {
      descriptions: [
        {
          fr: "UAI de l'organisme à rechercher",
          en: "UAI of the organization to search for",
        },
      ],
    },
    siret: {
      descriptions: [
        {
          fr: "SIRET de l'organisme à rechercher",
          en: "SIRET of the organization to search for",
        },
      ],
    },
  },
  response: {
    description: { en: "Success", fr: "Succès" },
    content: {
      descriptions: null,
      properties: {
        candidats: {
          descriptions: [
            {
              fr: "Liste des organismes candidats correspondant aux critères de recherche",
              en: "List of candidate organisms matching the search criteria",
            },
          ],
          items: resultItemDoc,
        },
        metadata: {
          descriptions: [
            {
              fr: "Métadonnées sur les critères de recherche effectuée",
              en: "Metadata on the search criteria performed",
            },
          ],
          properties: {
            siret: {
              descriptions: [
                {
                  fr: "Metadata sur le SIRET de recherche",
                  en: "Metadata on the searched SIRET",
                },
              ],
              anyOf: [
                {
                  descriptions: null,
                  properties: {
                    status: {
                      descriptions: null,
                    },
                  },
                },
                {
                  descriptions: null,
                },
              ],
            },
            uai: {
              descriptions: [
                {
                  fr: "Metadata sur l'UAI de recherche",
                  en: "Metadata on the searched UAI",
                },
              ],
              anyOf: [
                {
                  descriptions: null,
                  properties: {
                    status: {
                      descriptions: null,
                    },
                  },
                },
                {
                  descriptions: null,
                },
              ],
            },
          },
        },
        resultat: {
          descriptions: [
            {
              fr: "Meilleur résultat correspondant aux critères de recherche. Peut être null si aucun résultat sastisfaisant n'est trouvé.",
              en: "Best result matching the search criteria. Can be null if no satisfactory result is found.",
            },
          ],
          anyOf: [
            resultItemDoc,
            {
              descriptions: null,
            },
          ],
        },
      },
    },
  },
} as const satisfies DocRoute;
