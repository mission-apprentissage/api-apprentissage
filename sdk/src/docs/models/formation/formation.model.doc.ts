import type { DocTechnicalField } from "../../types.js";

export const formationModelDoc = {
  descriptions: [{ en: "Training", fr: "Formation" }],
  properties: {
    certification: {
      descriptions: [{ fr: "Certification de la formation", en: "Training certification" }],
      properties: {
        connue: {
          descriptions: [
            {
              fr: "Indique si la certification est connue de l'API",
              en: "Is the certification known?",
            },
            {
              fr: "Lorsque la certification est connue, alors la certification est disponible dans l'API certifications",
              en: "When the certification is known, then the certification is available in the certifications API",
            },
            {
              fr: "Dans le cas contraire, la certification est construite à partir des informations issue du RNCP et du CFD indépendemment.",
              en: "Otherwise, the certification is built from the information from the RNCP and the CFD independently.",
            },
          ],
        },
        valeur: {
          descriptions: [
            {
              fr: "Valeur de la certification",
              en: "Certification value",
            },
          ],
        },
      },
    },
    contact: {
      descriptions: [
        {
          fr: "Coordonnées à utiliser pour contacter l'organisme",
          en: "Contact information to use to contact the organism",
        },
      ],
      properties: {
        email: {
          descriptions: [{ fr: "Email de contact de la formation", en: "Training contact email" }],
        },
        telephone: {
          descriptions: [{ fr: "Téléphone de contact de la formation", en: "Training contact phone" }],
        },
      },
    },
    contenu_educatif: {
      descriptions: [{ fr: "Contenu éducatif de la formation", en: "Educational content of the training" }],
      properties: {
        contenu: {
          descriptions: [{ fr: "Contenu de la formation", en: "Training content" }],
        },
        objectif: {
          descriptions: [{ fr: "Objectif de la formation", en: "Training objective" }],
        },
      },
    },
    formateur: {
      descriptions: [
        { fr: "Formateur de la formation", en: "Training trainer" },
        {
          fr: "L'organisme formateur a pour mission de dispenser la formation",
          en: "The training organization is responsible for providing the training",
        },
      ],
      properties: {
        connu: {
          descriptions: [
            {
              fr: "Indique si le formateur est connu de l'API",
              en: "Indicates if the trainer is known to the API",
            },
            {
              fr: "L'organisme est connu lorsqu'il est présent dans [le référentiel des organismes de formation](https://referentiel.apprentissage.onisep.fr/organismes) ou s'il l'a été dans le passé.",
              en: "The organization is known when it is present in [the training organizations repository](https://referentiel.apprentissage.onisep.fr/organismes) or if it has been in the past.",
            },
            {
              fr: "Il peut s'agir d'un organisme qui n'est plus sur le référentiel des organismes de formation. Veuillez vérifier le statut de l'organisme.",
              en: "It can be an organization that is no longer on the training organizations repository. Please check the status of the organization.",
            },
          ],
        },
        organisme: {
          descriptions: [{ fr: "L'organisme de formation", en: "Training organism" }],
          oneOf: [{ descriptions: null }, { descriptions: null }],
        },
      },
    },
    identifiant: {
      descriptions: [{ fr: "Identifiant de la formation", en: "Training identifier" }],
      properties: {
        cle_ministere_educatif: {
          descriptions: [
            {
              fr: "Identifiant unique de la formation sur [le catalogue des formations en apprentissage](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
              en: "Unique identifier to identify a training on [the apprenticeship training catalog](https://catalogue-apprentissage.intercariforef.org/recherche/formations)",
            },
          ],
        },
      },
    },
    lieu: {
      descriptions: [{ fr: "Lieu où la formation est dispensée", en: "Place where the training is given" }],
      properties: {
        adresse: {
          descriptions: [{ fr: "Adresse du lieu de formation", en: "Training place address" }],
        },
        geolocalisation: {
          descriptions: [{ fr: "Coordonnées GPS du lieu de formation", en: "GPS coordinates of the training place" }],
        },
        precision: {
          descriptions: [
            {
              fr: "Précision de la géolocalisation du lieu de formation",
              en: "Precision of the geolocation of the training place",
            },
            { fr: "La précision est exprimée en mètre", en: "The precision is expressed in meters" },
            {
              fr: "Il s'agit de la distance entre le point géolocalisé et la locasation déduite de l'adresse",
              en: "This is the distance between the geolocated point and the location deduced from the address",
            },
          ],
        },
        siret: {
          descriptions: [{ fr: "Numéro SIRET du lieu de formation", en: "Training place SIRET number" }],
        },
        uai: {
          descriptions: [{ fr: "Numéro UAI du lieu de formation", en: "Training place UAI number" }],
        },
      },
    },
    modalite: {
      descriptions: [{ fr: "Modalité de la formation", en: "Training modality" }],
      properties: {
        annee_cycle: {
          descriptions: [{ fr: "Année du cycle de la formation", en: "Training cycle year" }],
        },
        duree_indicative: {
          descriptions: [{ fr: "Durée indicative de la formation", en: "Indicative duration of the training" }],
        },
        entierement_a_distance: {
          descriptions: [
            {
              fr: "Indique si la formation est entièrement à distance",
              en: "Indicates if the training is entirely remote",
            },
          ],
        },
        mef_10: {
          descriptions: [{ fr: "Code MEF 10 de la formation", en: "Training MEF 10 code" }],
        },
      },
    },
    onisep: {
      descriptions: [
        {
          fr: "Informations lié à la formation issue de l'ONISEP",
          en: "Information related to the training from the ONISEP",
        },
      ],
      properties: {
        discipline: { descriptions: null },
        domaine_sousdomaine: { descriptions: null },
        intitule: { descriptions: null },
        libelle_poursuite: { descriptions: null },
        lien_site_onisepfr: { descriptions: null },
        url: { descriptions: null },
      },
    },
    responsable: {
      descriptions: [
        {
          fr: "Responsable de la formation",
          en: "Training manager",
        },
        {
          fr: "Le responsable de la formation est l'organisme qui a la responsabilité administrative de la formation",
          en: "The training manager is the organization that has the administrative responsibility for the training",
        },
        {
          fr: "Il peut s'agir d'un organisme qui n'est plus sur le référentiel des organismes de formation. Veuillez vérifier le statut de l'organisme.",
          en: "It can be an organization that is no longer on the training organizations repository. Please check the status of the organization.",
        },
      ],
      properties: {
        connu: {
          descriptions: [
            {
              fr: "Indique si le responsable est connu de l'API",
              en: "Indicates if the manager is known to the API",
            },
            {
              fr: "L'organisme est connu lorsqu'il est présent dans [le référentiel des organismes de formation](https://referentiel.apprentissage.onisep.fr/organismes) ou s'il l'a été dans le passé.",
              en: "The organization is known when it is present in [the training organizations repository](https://referentiel.apprentissage.onisep.fr/organismes) or if it has been in the past.",
            },
          ],
        },
        organisme: {
          descriptions: [{ fr: "L'organisme responsable", en: "Responsible organism" }],
          oneOf: [{ descriptions: null }, { descriptions: null }],
        },
      },
    },
    sessions: {
      descriptions: [{ fr: "Liste des sessions de formation", en: "List of training sessions" }],
      items: {
        descriptions: [{ fr: "Session de formation", en: "Training session" }],
        properties: {
          capacite: {
            descriptions: [{ fr: "Capacité de la session", en: "Session capacity" }],
          },
          debut: {
            descriptions: [{ fr: "Date de début de la session", en: "Session start date" }],
          },
          fin: {
            descriptions: [{ fr: "Date de fin de la session", en: "Session end date" }],
          },
        },
      },
    },
    statut: {
      descriptions: [{ fr: "Statut de la formation", en: "Training status" }],
      properties: {
        catalogue: {
          descriptions: [{ fr: "Statut de la formation sur le catalogue", en: "Training status on the catalog" }],
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
