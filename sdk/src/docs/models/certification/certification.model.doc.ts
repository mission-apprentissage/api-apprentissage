import { certificationsPageDoc } from "../../metier/certifications/certifications.doc.js";
import type { DocTechnicalField } from "../../types.js";
import baseLegaleCfdAbrogationNotes from "./fr/base_legale.cfd.abrogation.notes.md.js";
import baseLegaleCfdCreationNotes from "./fr/base_legale.cfd.creation.notes.md.js";
import continuiteDescCfdNotes from "./fr/continuite.description.cfd.notes.md.js";
import continuiteRncpNotes from "./fr/continuite.rncp.notes.md.js";
import domainesNsfCfdNotes from "./fr/domaines.nsf.cfd.notes.md.js";
import identifiantCfdNotes from "./fr/identifiant.cfd.notes.md.js";
import identifiantRncpNotes from "./fr/identifiant.rncp.notes.md.js";
import identiantRncpAnterieur2019Notes from "./fr/identifiant.rncp_anterieur_2019.notes.md.js";
import intituleNiveauCfdEuropeenNotes from "./fr/intitule.niveau.cfd.europeen.notes.md.js";
import periodeValiditeRncpActivationNotes from "./fr/periode_validite.rncp.activation.notes.md.js";

export const certificationModelDoc = {
  descriptions: [{ en: null, fr: "Certification" }],
  properties: {
    identifiant: {
      descriptions: [
        {
          en: null,
          fr: "les fiches RNCP antérieures à la réforme de 2019 ont certaines données qui ne sont pas renseignées, elles sont identifiées par le champ `rncp_anterieur_2019` à `true`.",
        },
      ],
      properties: {
        cfd: {
          descriptions: [
            { en: null, fr: "Code Formation Diplôme (CFD) de la certification." },
            { en: null, fr: "Notes:" },
            { en: null, fr: identifiantCfdNotes },
          ],
          examples: ["50022137"],
        },
        rncp: {
          descriptions: [
            {
              en: null,
              fr: "Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.",
            },
            { en: null, fr: "Notes:" },
            { en: null, fr: identifiantRncpNotes },
          ],
          examples: ["RNCP37537"],
        },
        rncp_anterieur_2019: {
          descriptions: [
            {
              en: null,
              fr: "Identifie les certifications dont le code RNCP correspond à une fiche antérieure à la réforme de 2019.",
            },
            { en: null, fr: "Notes:" },
            { en: null, fr: identiantRncpAnterieur2019Notes },
          ],
        },
      },
    },
    periode_validite: {
      descriptions: [
        {
          en: null,
          fr: "**Un couple CFD-RNCP a une période de validité** qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
        },
        { en: null, fr: "Notes:" },
        { en: null, fr: "Les dates sont retournées au format ISO 8601 avec le fuseau horaire Europe/Paris." },
      ],
      properties: {
        debut: {
          descriptions: [
            {
              en: null,
              fr: "Date de début de validité de la certification. Cette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP.",
            },
            { en: null, fr: "Notes:" },
            {
              en: null,
              fr: "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
            },
          ],
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        },
        fin: {
          descriptions: [
            {
              en: null,
              fr: "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
            },
          ],
          examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
        },
        cfd: {
          descriptions: [{ en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." }],
          properties: {
            ouverture: {
              descriptions: [
                { en: null, fr: "Date d'ouverture du diplôme." },
                { en: null, fr: "Notes:" },
                {
                  en: null,
                  fr: "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
                },
              ],
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            fermeture: {
              descriptions: [
                { en: null, fr: "Date de fermeture du diplôme." },
                { en: null, fr: "Notes:" },
                {
                  en: null,
                  fr: "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                },
              ],
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
            premiere_session: {
              descriptions: [{ en: null, fr: "Année de sortie des premiers diplômés." }],
              examples: [2022],
            },
            derniere_session: {
              descriptions: [{ en: null, fr: "Année de sortie des derniers diplômés." }],
              examples: [2025],
            },
          },
        },
        rncp: {
          descriptions: [{ en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." }],
          properties: {
            actif: {
              descriptions: [
                {
                  en: null,
                  fr: "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
                },
              ],
            },
            activation: {
              descriptions: [
                { en: null, fr: "Date à laquelle la fiche RNCP est passée au statut `actif`." },
                { en: null, fr: "Notes:" },
                { en: null, fr: periodeValiditeRncpActivationNotes },
              ],
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            debut_parcours: {
              descriptions: [
                {
                  en: null,
                  fr: "Date de début des parcours certifiants. Anciennement appelée 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.",
                },
                { en: null, fr: "Notes:" },
                {
                  en: null,
                  fr: "La date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.",
                },
              ],
            },
            fin_enregistrement: {
              descriptions: [
                { en: null, fr: "Date de fin d’enregistrement d’une fiche au RNCP." },
                { en: null, fr: "Notes:" },
                {
                  en: null,
                  fr: "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                },
              ],
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
          },
        },
      },
    },
    intitule: {
      descriptions: null,
      properties: {
        cfd: {
          descriptions: [
            {
              en: null,
              fr: "Intitulés de la certification issue de la base centrale des nomenclatures (BCN).",
            },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          ],
          properties: {
            court: {
              descriptions: [{ en: null, fr: "**Intitulé court du diplôme.**" }],
              examples: ["BOULANGER", "GENIE BIO - AGRONOMIE"],
            },
            long: {
              descriptions: [{ en: null, fr: "**Intitulé long du diplôme.**" }],
              examples: ["BOULANGER (CAP)", "GENIE BIOLOGIQUE OPTION AGRONOMIE (DUT)"],
            },
          },
        },
        rncp: {
          descriptions: [
            { en: null, fr: "Intitulé de la certification issue de France Compétences." },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          ],
          examples: ["Boulanger"],
        },
        niveau: {
          descriptions: [{ en: null, fr: "Niveau de qualification de la certification professionnelle" }],
          properties: {
            cfd: {
              descriptions: [
                {
                  en: null,
                  fr: "Niveau de la certification issue de la base centrale des nomenclatures (BCN).",
                },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
              ],
              properties: {
                sigle: {
                  descriptions: null,
                  examples: ["CAP", "DUT", "BTS", "CPGE"],
                },
                europeen: {
                  descriptions: [
                    {
                      en: null,
                      fr: "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                    },
                    { en: null, fr: "Notes:" },
                    { en: null, fr: intituleNiveauCfdEuropeenNotes },
                  ],
                  examples: ["3", "5"],
                },
                formation_diplome: {
                  descriptions: [
                    {
                      en: null,
                      fr: "Code à 3 caractères qui renseigne sur le niveau du diplôme suivant le référentiel de l'Éducation Nationale.",
                    },
                    { en: null, fr: "Notes:" },
                    { en: null, fr: "- correspond aux 3 premiers caractères du code CFD." },
                  ],
                  examples: ["500", "370"],
                },
                libelle: {
                  descriptions: null,
                  examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
                },
                interministeriel: {
                  descriptions: [
                    {
                      en: null,
                      fr: "code interministériel du niveau de la formation suivant le référentiel de l'Éducation Nationale.",
                    },
                    { en: null, fr: "Notes:" },
                    { en: null, fr: "- correspond au premier caractère du code CFD, sauf pour le CFD `01321401`" },
                  ],
                  examples: ["3", "6"],
                },
              },
            },
            rncp: {
              descriptions: [
                { en: null, fr: "Niveau de qualification issue de France Compétences." },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              ],
              properties: {
                europeen: {
                  descriptions: [
                    {
                      en: null,
                      fr: "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                    },
                    { en: null, fr: "Notes:" },
                    {
                      en: null,
                      fr: "- `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens.",
                    },
                  ],
                  examples: ["3"],
                },
              },
            },
          },
        },
      },
    },
    continuite: {
      descriptions: [certificationsPageDoc.data[0].sections.continuite.rows.continuite.description],
      properties: {
        cfd: {
          descriptions: [
            {
              en: null,
              fr: "Liste des diplômes assurant la continuité du diplôme. La liste inclut à la fois les diplômes remplacés et remplaçant. La liste est ordonnée par date d'ouverture du diplôme et inclut le diplôme courant.",
            },
            { en: null, fr: "Notes:" },
            { en: null, fr: continuiteDescCfdNotes },
          ],
          items: {
            descriptions: null,
            properties: {
              ouverture: {
                descriptions: [
                  {
                    en: null,
                    fr: "Date d'ouverture du diplôme.",
                  },
                  {
                    en: null,
                    fr: "Notes:",
                  },
                  {
                    en: null,
                    fr: "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
                  },
                ],
                examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
              },
              fermeture: {
                descriptions: [
                  {
                    en: null,
                    fr: "Date de fermeture du diplôme.",
                  },
                  {
                    en: null,
                    fr: "Notes:",
                  },
                  {
                    en: null,
                    fr: "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                  },
                ],
                examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
              },
              code: {
                descriptions: null,
              },
              courant: {
                descriptions: [
                  {
                    en: null,
                    fr: "Indique si le diplôme correspond au diplôme courant, i.e `identifiant.cfd` est égal au `code`.",
                  },
                ],
              },
            },
          },
        },
        rncp: {
          descriptions: [{ en: null, fr: continuiteRncpNotes }],
          items: {
            descriptions: null,
            properties: {
              activation: {
                descriptions: [
                  {
                    en: null,
                    fr: "Date à laquelle la fiche RNCP est passée au statut `actif`.",
                  },
                  {
                    en: null,
                    fr: "Notes:",
                  },
                  {
                    en: null,
                    fr: "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.\n\n- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
                  },
                ],
                examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
              },
              fin_enregistrement: {
                descriptions: [
                  {
                    en: null,
                    fr: "Date de fin d’enregistrement d’une fiche au RNCP.",
                  },
                  {
                    en: null,
                    fr: "Notes:",
                  },
                  {
                    en: null,
                    fr: "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                  },
                ],
                examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
              },
              code: {
                descriptions: [
                  {
                    en: null,
                    fr: "Indique si la fiche correspond à la fiche courante, i.e `identifiant.rncp` est égal au `code`.",
                  },
                ],
              },
              courant: {
                descriptions: null,
              },
              actif: {
                descriptions: [
                  {
                    en: null,
                    fr: "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
                  },
                ],
              },
            },
          },
        },
      },
    },
    blocs_competences: {
      descriptions: [
        {
          en: null,
          fr: "Liste du (ou des) code (s) et intitulé(s) des blocs de compétences validées par la certification",
        },
      ],
      properties: {
        rncp: {
          descriptions: [
            { en: null, fr: "Liste des blocs de compétences issue de France Compétences." },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          ],
          items: {
            descriptions: null,
            properties: {
              code: {
                descriptions: null,
                examples: ["RNCP37537BC01"],
              },
              intitule: {
                descriptions: null,
                examples: ["Approvisionnement, communication, sécurité alimentaire et hygiène en boulangerie"],
              },
            },
          },
        },
      },
    },
    domaines: {
      descriptions: null,
      properties: {
        nsf: {
          descriptions: null,
          properties: {
            cfd: {
              descriptions: [
                { en: null, fr: "NSF issue de la base centrale des nomenclatures (BCN)." },
                { en: null, fr: "Notes:" },
                { en: null, fr: domainesNsfCfdNotes },
              ],
              properties: {
                code: {
                  descriptions: null,
                  examples: ["221", "310"],
                },
                intitule: {
                  descriptions: null,
                  examples: ["AGRO-ALIMENTAIRE, ALIMENTATION, CUISINE", "SPECIALIT.PLURIV.DES ECHANGES & GESTION"],
                },
              },
            },
            rncp: {
              descriptions: [
                { en: null, fr: "NSF issue de France Compétences." },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              ],
              items: {
                descriptions: null,
                properties: {
                  code: {
                    descriptions: null,
                    examples: ["221"],
                  },
                  intitule: {
                    descriptions: null,
                    examples: ["221 : Agro-alimentaire, alimentation, cuisine"],
                  },
                },
              },
            },
          },
        },
        rome: {
          descriptions: [{ en: null, fr: "Répertoire Opérationnel des Métiers et des Emplois (ROME)." }],
          properties: {
            rncp: {
              descriptions: [
                { en: null, fr: "ROME issue de France Compétences." },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              ],
              items: {
                descriptions: null,
                properties: {
                  code: {
                    descriptions: null,
                    examples: ["D1102"],
                  },
                  intitule: {
                    descriptions: null,
                    examples: ["Boulangerie - viennoiserie"],
                  },
                },
              },
            },
          },
        },
        formacodes: {
          descriptions: [
            { en: null, fr: "Formacode® issue de France Compétences." },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          ],
          properties: {
            rncp: {
              descriptions: [
                {
                  en: null,
                  fr: "Formacode® issue de France Compétences.",
                },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              ],
              items: {
                descriptions: null,
                properties: {
                  code: {
                    descriptions: null,
                    examples: ["21538"],
                  },
                  intitule: {
                    descriptions: null,
                    examples: ["21538 : Boulangerie"],
                  },
                },
              },
            },
          },
        },
      },
    },
    type: {
      descriptions: null,
      properties: {
        nature: {
          descriptions: [{ en: null, fr: "Nature du diplôme." }],
          properties: {
            cfd: {
              descriptions: [
                { en: null, fr: "Nature du diplôme issue de la base centrale des nomenclatures (BCN)." },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
              ],
              properties: {
                code: {
                  descriptions: null,
                  examples: ["1", "2", "P"],
                },
                libelle: {
                  descriptions: null,
                  examples: [
                    "DIPLOME NATIONAL / DIPLOME D'ETAT",
                    "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
                    "CLASSE PREPA",
                  ],
                },
              },
            },
          },
        },
        gestionnaire_diplome: {
          descriptions: [
            { en: null, fr: "Service responsable de la définition du diplôme." },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          ],
          examples: ["DGESCO A2-3"],
        },
        enregistrement_rncp: {
          descriptions: [
            {
              en: null,
              fr: "Permet de savoir si la certification est enregistrée de droit ou sur demande au Repertoire National des Certifications Professionnelles (RNCP)",
            },
            { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          ],
          examples: ["Enregistrement de droit"],
        },
        voie_acces: {
          descriptions: [{ en: null, fr: "Voie d’accès à la certification." }],
          properties: {
            rncp: {
              descriptions: [
                { en: null, fr: "Voie d’accès à la certification issue de France Compétences." },
                { en: null, fr: "Notes:" },
                { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              ],
              properties: {
                apprentissage: {
                  descriptions: [{ en: null, fr: "Certification accessible en contrat d’apprentissage." }],
                },
                experience: {
                  descriptions: [{ en: null, fr: "Certification accessible par expérience." }],
                },
                candidature_individuelle: {
                  descriptions: [{ en: null, fr: "Certification accessible par candidature individuelle." }],
                },
                contrat_professionnalisation: {
                  descriptions: [{ en: null, fr: "Certification accessible en contrat de professionnalisation." }],
                },
                formation_continue: {
                  descriptions: [
                    {
                      en: null,
                      fr: "Certification accessible après un parcours de formation continue.",
                    },
                  ],
                },
                formation_statut_eleve: {
                  descriptions: [
                    {
                      en: null,
                      fr: "Certification accessible après un parcours de formation sous statut d’élève ou d’étudiant.",
                    },
                  ],
                },
              },
            },
          },
        },
        certificateurs_rncp: {
          descriptions: [
            { en: null, fr: "Liste des certificateurs de la fiche RNCP." },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          ],
          items: {
            descriptions: null,
            properties: {
              siret: {
                descriptions: [{ en: null, fr: "Numéro SIRET du certificateur renseigné dans le RNCP." }],
              },
              nom: {
                descriptions: [{ en: null, fr: "Nom du certificateur renseigné dans le RNCP." }],
              },
            },
          },
        },
      },
    },
    base_legale: {
      descriptions: [{ en: null, fr: "Dates de création et d’abrogation des diplômes crées par arrêtés" }],
      properties: {
        cfd: {
          descriptions: [
            {
              en: null,
              fr: "Informations légales issue de la base centrale des nomenclatures (BCN) relatives au diplôme.",
            },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          ],
          properties: {
            creation: {
              descriptions: [
                { en: null, fr: "Date d'arrêté de création du diplôme." },
                { en: null, fr: "Notes:" },
                { en: null, fr: baseLegaleCfdCreationNotes },
              ],
              examples: ["2014-02-21T00:00:00.000+01:00", "2018-05-11T00:00:00.000+02:00"],
            },
            abrogation: {
              descriptions: [
                { en: null, fr: "Date d'arrêté d'abrogation du diplôme." },
                { en: null, fr: "Notes:" },
                { en: null, fr: baseLegaleCfdAbrogationNotes },
              ],
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
          },
        },
      },
    },
    convention_collectives: {
      descriptions: [
        {
          en: null,
          fr: "Liste(s) de la ou des convention(s) collective(s) rattachées à la certification",
        },
      ],
      properties: {
        rncp: {
          descriptions: [
            { en: null, fr: "Liste des conventions collectives issue de France Compétences." },
            { en: null, fr: "Notes:" },
            { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          ],
          items: {
            descriptions: null,
            properties: {
              numero: {
                descriptions: null,
                examples: ["3002"],
              },
              intitule: {
                descriptions: null,
                examples: ["Bâtiment (Employés, techniciens et agents de maîtrise, ingénieurs, assimilés et cadres)"],
              },
            },
          },
        },
      },
    },
  },
} as const satisfies DocTechnicalField;
