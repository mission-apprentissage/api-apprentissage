import type { DataSource, DocModel } from "../../types.js";
import baseLegaleCfdAbrogationNotes from "./docs/base_legale.cfd.abrogation.notes.md.js";
import baseLegaleCfdCreationNotes from "./docs/base_legale.cfd.creation.notes.md.js";
import continuiteDescCfdNotes from "./docs/continuite.description.cfd.notes.md.js";
import continuiteDesc from "./docs/continuite.description.md.js";
import continuiteRncpDesc from "./docs/continuite.rncp.description.md.js";
import continuiteRncpNotes from "./docs/continuite.rncp.notes.md.js";
import domainesDesc from "./docs/domaines.description.md.js";
import domainesNsfCfdNotes from "./docs/domaines.nsf.cfd.notes.md.js";
import identifiantCfdNotes from "./docs/identifiant.cfd.notes.md.js";
import identifiantInfo from "./docs/identifiant.information.md.js";
import identifiantRncpNotes from "./docs/identifiant.rncp.notes.md.js";
import identiantRncpAnterieur2019Notes from "./docs/identifiant.rncp_anterieur_2019.notes.md.js";
import identifiantTip from "./docs/identifiant.tip.md.js";
import intituleDesc from "./docs/intitule.description.md.js";
import intituleNiveauCfdEuropeenNotes from "./docs/intitule.niveau.cfd.europeen.notes.md.js";
import intituleNiveauTip from "./docs/intitule.niveau.tip.md.js";
import periodeValiditeCfdDesc from "./docs/periode_validite.cfd.description.md.js";
import periodeValiditeRncpActivationNotes from "./docs/periode_validite.rncp.activation.notes.md.js";
import periodeValiditeRncpDesc from "./docs/periode_validite.rncp.description.md.js";
import typeDesc from "./docs/type.description.md.js";

const sources: DataSource[] = [
  {
    name: "Répertoire National des Certifications Professionnelles (RNCP)",
    logo: { href: "/asset/logo/france_competences.png", width: 171, height: 48 },
    providers: ["France Compétences (FC)"],
    href: "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-certifications-professionnelles-et-repertoire-specifique/",
  },
  {
    name: "Base Centrale des Nomenclatures (BCN)",
    logo: { href: "/asset/logo/education_nationale.png", width: 98, height: 80 },
    providers: ["Éducation nationale (EN)"],
    href: "https://infocentre.pleiade.education.fr/bcn/index.php/domaine/voir/id/45",
  },
  {
    name: "Kit apprentissage (sur demande)",
    logo: { href: "/asset/logo/carif-oref-onisep.png", width: 130, height: 80 },
    providers: ["Réseau des carif-oref (RCO)", "Onisep"],
    href: "https://www.intercariforef.org/blog/communique-de-presse-france-competences-onisep-rco",
  },
];

export const certificationModelDoc = {
  name: "Certification",
  description: null,
  sources,
  _: {
    identifiant: {
      section: "Identifiant",
      metier: true,
      description:
        "**Une certification correspond à un couple CFD-RNCP sur une période donnée.** Le Code Formation Diplôme (CFD) ou code scolarité référence la certification dans la Base Centrale des Nomenclature. Le code RNCP référence la certification dans le Répertoire National des Certifications Professionnelle.",
      information: identifiantInfo,
      sample: "exemple : La certification correspond au couple CFD 50022137 - RNCP37537",
      tags: [".cfd", ".rncp", ".rncp_anterieur_2019"],
      tip: {
        title: "structure des codes CFD et RNCP",
        content: identifiantTip,
      },
      notes:
        "- les fiches RNCP antérieures à la réforme de 2019 ont certaines données qui ne sont pas renseignées, elles sont identifiées par le champ `rncp_anterieur_2019` à `true`.",
      _: {
        cfd: {
          description: "Code Formation Diplôme (CFD) de la certification.",
          notes: identifiantCfdNotes,
          examples: ["50022137"],
        },
        rncp: {
          description: "Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.",
          notes: identifiantRncpNotes,
          examples: ["RNCP37537"],
        },
        rncp_anterieur_2019: {
          description:
            "Identifie les certifications dont le code RNCP correspond à une fiche antérieure à la réforme de 2019.",
          notes: identiantRncpAnterieur2019Notes,
        },
      },
    },
    periode_validite: {
      section: "Période de validité",
      metier: true,
      description:
        "**Un couple CFD-RNCP a une période de validité** qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
      sample: "exemple : du 01.09.2021 au 31.08.2026",
      tags: [".debut", ".fin"],
      notes: "Les dates sont retournées au format ISO 8601 avec le fuseau horaire Europe/Paris.",
      _: {
        debut: {
          description:
            "Date de début de validité de la certification. Cette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP.",
          notes:
            "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        },
        fin: {
          description:
            "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
          examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
        },
        cfd: {
          section: "Période de validité",
          metier: true,
          description: periodeValiditeCfdDesc,
          notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
          tags: [".ouverture", ".fermeture", ".premiere_session", ".derniere_session"],
          _: {
            ouverture: {
              description: "Date d'ouverture du diplôme.",
              notes:
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            fermeture: {
              description: "Date de fermeture du diplôme.",
              notes:
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
            premiere_session: {
              description: "Année de sortie des premiers diplômés.",
              examples: [2022],
            },
            derniere_session: {
              description: "Année de sortie des derniers diplômés.",
              examples: [2025],
            },
          },
        },
        rncp: {
          section: "Période de validité",
          metier: true,
          description: periodeValiditeRncpDesc,
          information:
            "Un enregistrement au RNCP est de maximum 5 ans, dépassé ce délai toute fiche doit fait l’objet d’une demande de renouvellement.",
          sample: null,
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          tip: null,
          tags: [".actif", ".activation", ".debut_parcours", ".fin_enregistrement"],
          _: {
            actif: {
              description:
                "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
            },
            activation: {
              description: "Date à laquelle la fiche RNCP est passée au statut `actif`.",
              notes: periodeValiditeRncpActivationNotes,
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            debut_parcours: {
              description:
                "Date de début des parcours certifiants. Anciennement appelée 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.",
              notes: "La date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.",
            },
            fin_enregistrement: {
              description: "Date de fin d’enregistrement d’une fiche au RNCP.",
              notes:
                "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
          },
        },
      },
    },
    intitule: {
      section: "Intitulé",
      metier: true,
      description: intituleDesc,
      sample: "exemple : Boulanger",
      tags: [".cfd.court", ".cfd.long", ".rncp"],
      _: {
        cfd: {
          description: "Intitulés de la certification issue de la base centrale des nomenclatures (BCN).",
          notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
          _: {
            court: {
              description: "**Intitulé court du diplôme.**",
              examples: ["BOULANGER", "GENIE BIO - AGRONOMIE"],
            },
            long: {
              description: "**Intitulé long du diplôme.**",
              examples: ["BOULANGER (CAP)", "GENIE BIOLOGIQUE OPTION AGRONOMIE (DUT)"],
            },
          },
        },
        rncp: {
          description: "Intitulé de la certification issue de France Compétences.",
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          examples: ["Boulanger"],
        },
        niveau: {
          section: "Intitulé",
          metier: true,
          description: "Niveau de qualification de la certification professionnelle",
          sample: "exemple : CAP et/ou Niveau 3",
          tags: [".cfd.sigle", ".cfd.europeen", ".cfd.formation_diplome", ".cfd.libelle"],
          tip: {
            title: "équivalence des niveaux",
            content: intituleNiveauTip,
          },
          _: {
            cfd: {
              description: "Niveau de la certification issue de la base centrale des nomenclatures (BCN).",
              notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
              _: {
                sigle: {
                  description: null,
                  examples: ["CAP", "DUT", "BTS", "CPGE"],
                },
                europeen: {
                  description:
                    "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                  notes: intituleNiveauCfdEuropeenNotes,
                  examples: ["3", "5"],
                },
                formation_diplome: {
                  description:
                    "Code à 3 caractères qui renseigne sur le niveau du diplôme suivant le référentiel de l'Éducation Nationale.",
                  notes: "- correspond aux 3 premiers caractères du code CFD.",
                  examples: ["500", "370"],
                },
                libelle: {
                  description: null,
                  examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
                },
                interministeriel: {
                  description:
                    "code interministériel du niveau de la formation suivant le référentiel de l'Éducation Nationale.\n\nNotes:\n\n- correspond au premier caractère du code CFD, sauf pour le CFD `01321401`",
                  examples: ["3", "6"],
                },
              },
            },
            rncp: {
              description: "Niveau de qualification issue de France Compétences.",
              notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              _: {
                europeen: {
                  description:
                    "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                  notes: "- `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens.",
                  examples: ["3"],
                },
              },
            },
          },
        },
      },
    },
    continuite: {
      section: "Continuité",
      description: continuiteDesc,
      metier: true,
      tags: [
        ".cfd[].ouverture",
        ".cfd[].fermeture",
        ".cfd[].code",
        ".cfd[].courant",
        ".rncp[].activation",
        ".rncp[].fin_enregistrement",
        ".rncp[].code",
        ".rncp[].courant",
        ".rncp[].actif",
      ],
      _: {
        cfd: {
          description:
            "Liste des diplômes assurant la continuité du diplôme. La liste inclut à la fois les diplômes remplacés et remplaçant. La liste est ordonnée par date d'ouverture du diplôme et inclut le diplôme courant.",
          notes: continuiteDescCfdNotes,
          _: {
            "[]": {
              description: null,
              _: {
                ouverture: {
                  description:
                    "Date d'ouverture du diplôme.\n\nNotes:\n\n- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
                  examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
                },
                fermeture: {
                  description:
                    "Date de fermeture du diplôme.\n\nNotes:\n\n- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                  examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
                },
                code: {
                  description: null,
                },
                courant: {
                  description:
                    "Indique si le diplôme correspond au diplôme courant, i.e `identifiant.cfd` est égal au `code`.",
                },
              },
            },
          },
        },
        rncp: {
          description: continuiteRncpDesc,
          notes: continuiteRncpNotes,
          _: {
            "[]": {
              description: null,
              _: {
                activation: {
                  description:
                    "Date à laquelle la fiche RNCP est passée au statut `actif`.\n\nNotes:\n\n- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.\n\n- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
                  examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
                },
                fin_enregistrement: {
                  description:
                    "Date de fin d’enregistrement d’une fiche au RNCP.\n\nNotes:\n\n- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                  examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
                },
                code: {
                  description:
                    "Indique si la fiche correspond à la fiche courante, i.e `identifiant.rncp` est égal au `code`.",
                },
                courant: {
                  description: null,
                },
                actif: {
                  description:
                    "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
                },
              },
            },
          },
        },
      },
    },
    blocs_competences: {
      section: "Blocs de compétences",
      metier: true,
      description: "Liste du (ou des) code (s) et intitulé(s) des blocs de compétences validées par la certification",
      tags: [".rncp[].code", ".rncp[].intitule"],
      _: {
        rncp: {
          description: "Liste des blocs de compétences issue de France Compétences.",
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          _: {
            "[]": {
              description: null,
              _: {
                code: {
                  description: null,
                  examples: ["RNCP37537BC01"],
                },
                intitule: {
                  description: null,
                  examples: ["Approvisionnement, communication, sécurité alimentaire et hygiène en boulangerie"],
                },
              },
            },
          },
        },
      },
    },
    domaines: {
      section: "Domaines",
      metier: true,
      description: domainesDesc,
      tags: [
        ".nsf.cfd[].code",
        ".nsf.cfd[].intitule",
        ".nsf.rncp[].code",
        ".nsf.rncp[].intitule",
        ".rome.rncp[].code",
        ".rome.rncp[].intitule",
        ".formacodes.rncp[].code",
        ".formacodes.rncp[].intitule",
      ],
      _: {
        nsf: {
          description: null,
          _: {
            cfd: {
              description: "NSF issue de la base centrale des nomenclatures (BCN).",
              notes: domainesNsfCfdNotes,
              _: {
                code: {
                  description: null,
                  examples: ["221", "310"],
                },
                intitule: {
                  description: null,
                  examples: ["AGRO-ALIMENTAIRE, ALIMENTATION, CUISINE", "SPECIALIT.PLURIV.DES ECHANGES & GESTION"],
                },
              },
            },
            rncp: {
              description: "NSF issue de France Compétences.",
              notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              _: {
                "[]": {
                  description: null,
                  _: {
                    code: {
                      description: null,
                      examples: ["221"],
                    },
                    intitule: {
                      description: null,
                      examples: ["221 : Agro-alimentaire, alimentation, cuisine"],
                    },
                  },
                },
              },
            },
          },
        },
        rome: {
          description: "Répertoire Opérationnel des Métiers et des Emplois (ROME).",
          _: {
            rncp: {
              description: "ROME issue de France Compétences.",
              notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              _: {
                "[]": {
                  description: null,
                  _: {
                    code: {
                      description: null,
                      examples: ["D1102"],
                    },
                    intitule: {
                      description: null,
                      examples: ["Boulangerie - viennoiserie"],
                    },
                  },
                },
              },
            },
          },
        },
        formacodes: {
          description: "Formacode® issue de France Compétences.",
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          _: {
            rncp: {
              description:
                "Formacode® issue de France Compétences.\n\nNotes:\n\n- `null` lorsque le champs `identifiant.rncp` est `null`.",
              _: {
                "[]": {
                  description: null,
                  _: {
                    code: {
                      description: null,
                      examples: ["21538"],
                    },
                    intitule: {
                      description: null,
                      examples: ["21538 : Boulangerie"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    type: {
      section: "Type",
      metier: true,
      description: typeDesc,
      tags: [
        ".nature.cfd.code",
        ".nature.cfd.libelle",
        ".gestionnaire_diplome",
        ".certificateurs_rncp[].siret",
        ".certificateurs_rncp[].nom",
        ".enregistrement_rncp",
        ".voie_acces.rncp",
      ],
      _: {
        nature: {
          description: "Nature du diplôme.",
          _: {
            cfd: {
              description: "Nature du diplôme issue de la base centrale des nomenclatures (BCN).",
              notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
              _: {
                code: {
                  description: null,
                  examples: ["1", "2", "P"],
                },
                libelle: {
                  description: null,
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
          description: "Service responsable de la définition du diplôme.",
          notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
          examples: ["DGESCO A2-3"],
        },
        enregistrement_rncp: {
          description:
            "Permet de savoir si la certification est enregistrée de droit ou sur demande au Repertoire National des Certifications Professionnelles (RNCP)",
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          examples: ["Enregistrement de droit"],
        },
        voie_acces: {
          description: "Voie d’accès à la certification.",
          _: {
            rncp: {
              description: "Voie d’accès à la certification issue de France Compétences.",
              notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
              _: {
                apprentissage: {
                  description: "Certification accessible en contrat d’apprentissage.",
                },
                experience: {
                  description: "Certification accessible par expérience.",
                },
                candidature_individuelle: {
                  description: "Certification accessible par candidature individuelle.",
                },
                contrat_professionnalisation: {
                  description: "Certification accessible en contrat de professionnalisation.",
                },
                formation_continue: {
                  description: "Certification accessible après un parcours de formation continue.",
                },
                formation_statut_eleve: {
                  description:
                    "Certification accessible après un parcours de formation sous statut d’élève ou d’étudiant.",
                },
              },
            },
          },
        },
        certificateurs_rncp: {
          description: "Liste des certificateurs de la fiche RNCP.",
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          _: {
            "[]": {
              description: null,
              _: {
                siret: {
                  description: "Numéro SIRET du certificateur renseigné dans le RNCP.",
                },
                nom: {
                  description: "Nom du certificateur renseigné dans le RNCP.",
                },
              },
            },
          },
        },
      },
    },
    base_legale: {
      section: "Base légale",
      metier: true,
      description: "Dates de création et d’abrogation des diplômes crées par arrêtés",
      tags: [".cfd.creation", ".cfd.abrogation"],
      _: {
        cfd: {
          description: "Informations légales issue de la base centrale des nomenclatures (BCN) relatives au diplôme.",
          notes: "- `null` lorsque le champs `identifiant.cfd` est `null`.",
          _: {
            creation: {
              description: "Date d'arrêté de création du diplôme.",
              notes: baseLegaleCfdCreationNotes,
              examples: ["2014-02-21T00:00:00.000+01:00", "2018-05-11T00:00:00.000+02:00"],
            },
            abrogation: {
              description: "Date d'arrêté d'abrogation du diplôme.",
              notes: baseLegaleCfdAbrogationNotes,
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
          },
        },
      },
    },
    convention_collectives: {
      section: "Conventions collectives",
      metier: true,
      description: "Liste(s) de la ou des convention(s) collective(s) rattachées à la certification",
      tags: [".rncp[].numero", ".rncp[].libelle"],
      _: {
        rncp: {
          description: "Liste des conventions collectives issue de France Compétences.",
          notes: "- `null` lorsque le champs `identifiant.rncp` est `null`.",
          _: {
            "[]": {
              description: null,
              _: {
                numero: {
                  description: null,
                  examples: ["3002"],
                },
                intitule: {
                  description: null,
                  examples: ["Bâtiment (Employés, techniciens et agents de maîtrise, ingénieurs, assimilés et cadres)"],
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies DocModel;
