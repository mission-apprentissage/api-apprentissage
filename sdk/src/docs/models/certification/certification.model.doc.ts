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
      section: { en: null, fr: "Identifiant" },
      metier: true,
      description: {
        en: null,
        fr: "**Une certification correspond à un couple CFD-RNCP sur une période donnée.** Le Code Formation Diplôme (CFD) ou code scolarité référence la certification dans la Base Centrale des Nomenclature. Le code RNCP référence la certification dans le Répertoire National des Certifications Professionnelle.",
      },
      information: { en: null, fr: identifiantInfo },
      sample: { en: null, fr: "exemple : La certification correspond au couple CFD 50022137 - RNCP37537" },
      tags: [".cfd", ".rncp", ".rncp_anterieur_2019"],
      tip: {
        title: { en: null, fr: "structure des codes CFD et RNCP" },
        content: { en: null, fr: identifiantTip },
      },
      notes: {
        en: null,
        fr: "- les fiches RNCP antérieures à la réforme de 2019 ont certaines données qui ne sont pas renseignées, elles sont identifiées par le champ `rncp_anterieur_2019` à `true`.",
      },
      _: {
        cfd: {
          description: { en: null, fr: "Code Formation Diplôme (CFD) de la certification." },
          notes: { en: null, fr: identifiantCfdNotes },
          examples: ["50022137"],
        },
        rncp: {
          description: {
            en: null,
            fr: "Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.",
          },
          notes: { en: null, fr: identifiantRncpNotes },
          examples: ["RNCP37537"],
        },
        rncp_anterieur_2019: {
          description: {
            en: null,
            fr: "Identifie les certifications dont le code RNCP correspond à une fiche antérieure à la réforme de 2019.",
          },
          notes: { en: null, fr: identiantRncpAnterieur2019Notes },
        },
      },
    },
    periode_validite: {
      section: { en: null, fr: "Période de validité" },
      metier: true,
      description: {
        en: null,
        fr: "**Un couple CFD-RNCP a une période de validité** qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
      },
      sample: { en: null, fr: "exemple : du 01.09.2021 au 31.08.2026" },
      tags: [".debut", ".fin"],
      notes: { en: null, fr: "Les dates sont retournées au format ISO 8601 avec le fuseau horaire Europe/Paris." },
      _: {
        debut: {
          description: {
            en: null,
            fr: "Date de début de validité de la certification. Cette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP.",
          },
          notes: {
            en: null,
            fr: "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
          },
          examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
        },
        fin: {
          description: {
            en: null,
            fr: "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
          },
          examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
        },
        cfd: {
          section: { en: null, fr: "Période de validité" },
          metier: true,
          description: { en: null, fr: periodeValiditeCfdDesc },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          tags: [".ouverture", ".fermeture", ".premiere_session", ".derniere_session"],
          _: {
            ouverture: {
              description: { en: null, fr: "Date d'ouverture du diplôme." },
              notes: {
                en: null,
                fr: "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
              },
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            fermeture: {
              description: { en: null, fr: "Date de fermeture du diplôme." },
              notes: {
                en: null,
                fr: "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
              },
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
            premiere_session: {
              description: { en: null, fr: "Année de sortie des premiers diplômés." },
              examples: [2022],
            },
            derniere_session: {
              description: { en: null, fr: "Année de sortie des derniers diplômés." },
              examples: [2025],
            },
          },
        },
        rncp: {
          section: { en: null, fr: "Période de validité" },
          metier: true,
          description: { en: null, fr: periodeValiditeRncpDesc },
          information: {
            en: null,
            fr: "Un enregistrement au RNCP est de maximum 5 ans, dépassé ce délai toute fiche doit fait l’objet d’une demande de renouvellement.",
          },
          sample: null,
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          tip: null,
          tags: [".actif", ".activation", ".debut_parcours", ".fin_enregistrement"],
          _: {
            actif: {
              description: {
                en: null,
                fr: "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
              },
            },
            activation: {
              description: { en: null, fr: "Date à laquelle la fiche RNCP est passée au statut `actif`." },
              notes: { en: null, fr: periodeValiditeRncpActivationNotes },
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
            debut_parcours: {
              description: {
                en: null,
                fr: "Date de début des parcours certifiants. Anciennement appelée 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.",
              },
              notes: { en: null, fr: "La date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris." },
            },
            fin_enregistrement: {
              description: { en: null, fr: "Date de fin d’enregistrement d’une fiche au RNCP." },
              notes: {
                en: null,
                fr: "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
              },
              examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
            },
          },
        },
      },
    },
    intitule: {
      section: { en: null, fr: "Intitulé" },
      metier: true,
      description: { en: null, fr: intituleDesc },
      sample: { en: null, fr: "exemple : Boulanger" },
      tags: [".cfd.court", ".cfd.long", ".rncp"],
      _: {
        cfd: {
          description: {
            en: null,
            fr: "Intitulés de la certification issue de la base centrale des nomenclatures (BCN).",
          },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          _: {
            court: {
              description: { en: null, fr: "**Intitulé court du diplôme.**" },
              examples: ["BOULANGER", "GENIE BIO - AGRONOMIE"],
            },
            long: {
              description: { en: null, fr: "**Intitulé long du diplôme.**" },
              examples: ["BOULANGER (CAP)", "GENIE BIOLOGIQUE OPTION AGRONOMIE (DUT)"],
            },
          },
        },
        rncp: {
          description: { en: null, fr: "Intitulé de la certification issue de France Compétences." },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          examples: ["Boulanger"],
        },
        niveau: {
          section: { en: null, fr: "Intitulé" },
          metier: true,
          description: { en: null, fr: "Niveau de qualification de la certification professionnelle" },
          sample: { en: null, fr: "exemple : CAP et/ou Niveau 3" },
          tags: [".cfd.sigle", ".cfd.europeen", ".cfd.formation_diplome", ".cfd.libelle"],
          tip: {
            title: { en: null, fr: "équivalence des niveaux" },
            content: { en: null, fr: intituleNiveauTip },
          },
          _: {
            cfd: {
              description: {
                en: null,
                fr: "Niveau de la certification issue de la base centrale des nomenclatures (BCN).",
              },
              notes: { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
              _: {
                sigle: {
                  description: null,
                  examples: ["CAP", "DUT", "BTS", "CPGE"],
                },
                europeen: {
                  description: {
                    en: null,
                    fr: "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                  },
                  notes: { en: null, fr: intituleNiveauCfdEuropeenNotes },
                  examples: ["3", "5"],
                },
                formation_diplome: {
                  description: {
                    en: null,
                    fr: "Code à 3 caractères qui renseigne sur le niveau du diplôme suivant le référentiel de l'Éducation Nationale.",
                  },
                  notes: { en: null, fr: "- correspond aux 3 premiers caractères du code CFD." },
                  examples: ["500", "370"],
                },
                libelle: {
                  description: null,
                  examples: ["CLASSE PREPA", "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE"],
                },
                interministeriel: {
                  description: {
                    en: null,
                    fr: "code interministériel du niveau de la formation suivant le référentiel de l'Éducation Nationale.\n\nNotes:\n\n- correspond au premier caractère du code CFD, sauf pour le CFD `01321401`",
                  },
                  examples: ["3", "6"],
                },
              },
            },
            rncp: {
              description: { en: null, fr: "Niveau de qualification issue de France Compétences." },
              notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              _: {
                europeen: {
                  description: {
                    en: null,
                    fr: "Niveau de qualification de la certification (de 1 à 8) utilisés dans les référentiels nationaux européens.",
                  },
                  notes: {
                    en: null,
                    fr: "- `null` lorsque le niveau de diplôme n'a pas de correspondance avec les niveaux européens.",
                  },
                  examples: ["3"],
                },
              },
            },
          },
        },
      },
    },
    continuite: {
      section: { en: null, fr: "Continuité" },
      description: { en: null, fr: continuiteDesc },
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
          description: {
            en: null,
            fr: "Liste des diplômes assurant la continuité du diplôme. La liste inclut à la fois les diplômes remplacés et remplaçant. La liste est ordonnée par date d'ouverture du diplôme et inclut le diplôme courant.",
          },
          notes: { en: null, fr: continuiteDescCfdNotes },
          _: {
            "[]": {
              description: null,
              _: {
                ouverture: {
                  description: {
                    en: null,
                    fr: "Date d'ouverture du diplôme.\n\nNotes:\n\n- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
                  },
                  examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
                },
                fermeture: {
                  description: {
                    en: null,
                    fr: "Date de fermeture du diplôme.\n\nNotes:\n\n- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                  },
                  examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
                },
                code: {
                  description: null,
                },
                courant: {
                  description: {
                    en: null,
                    fr: "Indique si le diplôme correspond au diplôme courant, i.e `identifiant.cfd` est égal au `code`.",
                  },
                },
              },
            },
          },
        },
        rncp: {
          description: { en: null, fr: continuiteRncpDesc },
          notes: { en: null, fr: continuiteRncpNotes },
          _: {
            "[]": {
              description: null,
              _: {
                activation: {
                  description: {
                    en: null,
                    fr: "Date à laquelle la fiche RNCP est passée au statut `actif`.\n\nNotes:\n\n- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.\n\n- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
                  },
                  examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
                },
                fin_enregistrement: {
                  description: {
                    en: null,
                    fr: "Date de fin d’enregistrement d’une fiche au RNCP.\n\nNotes:\n\n- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
                  },
                  examples: ["2021-09-01T00:00:00.000+02:00", "2022-01-01T00:00:00.000+01:00"],
                },
                code: {
                  description: {
                    en: null,
                    fr: "Indique si la fiche correspond à la fiche courante, i.e `identifiant.rncp` est égal au `code`.",
                  },
                },
                courant: {
                  description: null,
                },
                actif: {
                  description: {
                    en: null,
                    fr: "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
                  },
                },
              },
            },
          },
        },
      },
    },
    blocs_competences: {
      section: { en: null, fr: "Blocs de compétences" },
      metier: true,
      description: {
        en: null,
        fr: "Liste du (ou des) code (s) et intitulé(s) des blocs de compétences validées par la certification",
      },
      tags: [".rncp[].code", ".rncp[].intitule"],
      _: {
        rncp: {
          description: { en: null, fr: "Liste des blocs de compétences issue de France Compétences." },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
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
      section: { en: null, fr: "Domaines" },
      metier: true,
      description: { en: null, fr: domainesDesc },
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
              description: { en: null, fr: "NSF issue de la base centrale des nomenclatures (BCN)." },
              notes: { en: null, fr: domainesNsfCfdNotes },
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
              description: { en: null, fr: "NSF issue de France Compétences." },
              notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
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
          description: { en: null, fr: "Répertoire Opérationnel des Métiers et des Emplois (ROME)." },
          _: {
            rncp: {
              description: { en: null, fr: "ROME issue de France Compétences." },
              notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
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
          description: { en: null, fr: "Formacode® issue de France Compétences." },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          _: {
            rncp: {
              description: {
                en: null,
                fr: "Formacode® issue de France Compétences.\n\nNotes:\n\n- `null` lorsque le champs `identifiant.rncp` est `null`.",
              },
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
      section: { en: null, fr: "Type" },
      metier: true,
      description: { en: null, fr: typeDesc },
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
          description: { en: null, fr: "Nature du diplôme." },
          _: {
            cfd: {
              description: { en: null, fr: "Nature du diplôme issue de la base centrale des nomenclatures (BCN)." },
              notes: { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
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
          description: { en: null, fr: "Service responsable de la définition du diplôme." },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          examples: ["DGESCO A2-3"],
        },
        enregistrement_rncp: {
          description: {
            en: null,
            fr: "Permet de savoir si la certification est enregistrée de droit ou sur demande au Repertoire National des Certifications Professionnelles (RNCP)",
          },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          examples: ["Enregistrement de droit"],
        },
        voie_acces: {
          description: { en: null, fr: "Voie d’accès à la certification." },
          _: {
            rncp: {
              description: { en: null, fr: "Voie d’accès à la certification issue de France Compétences." },
              notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
              _: {
                apprentissage: {
                  description: { en: null, fr: "Certification accessible en contrat d’apprentissage." },
                },
                experience: {
                  description: { en: null, fr: "Certification accessible par expérience." },
                },
                candidature_individuelle: {
                  description: { en: null, fr: "Certification accessible par candidature individuelle." },
                },
                contrat_professionnalisation: {
                  description: { en: null, fr: "Certification accessible en contrat de professionnalisation." },
                },
                formation_continue: {
                  description: { en: null, fr: "Certification accessible après un parcours de formation continue." },
                },
                formation_statut_eleve: {
                  description: {
                    en: null,
                    fr: "Certification accessible après un parcours de formation sous statut d’élève ou d’étudiant.",
                  },
                },
              },
            },
          },
        },
        certificateurs_rncp: {
          description: { en: null, fr: "Liste des certificateurs de la fiche RNCP." },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
          _: {
            "[]": {
              description: null,
              _: {
                siret: {
                  description: { en: null, fr: "Numéro SIRET du certificateur renseigné dans le RNCP." },
                },
                nom: {
                  description: { en: null, fr: "Nom du certificateur renseigné dans le RNCP." },
                },
              },
            },
          },
        },
      },
    },
    base_legale: {
      section: { en: null, fr: "Base légale" },
      metier: true,
      description: { en: null, fr: "Dates de création et d’abrogation des diplômes crées par arrêtés" },
      tags: [".cfd.creation", ".cfd.abrogation"],
      _: {
        cfd: {
          description: {
            en: null,
            fr: "Informations légales issue de la base centrale des nomenclatures (BCN) relatives au diplôme.",
          },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.cfd` est `null`." },
          _: {
            creation: {
              description: { en: null, fr: "Date d'arrêté de création du diplôme." },
              notes: { en: null, fr: baseLegaleCfdCreationNotes },
              examples: ["2014-02-21T00:00:00.000+01:00", "2018-05-11T00:00:00.000+02:00"],
            },
            abrogation: {
              description: { en: null, fr: "Date d'arrêté d'abrogation du diplôme." },
              notes: { en: null, fr: baseLegaleCfdAbrogationNotes },
              examples: ["2022-08-31T23:59:59.000+02:00", "2022-12-31T23:59:59.000+01:00"],
            },
          },
        },
      },
    },
    convention_collectives: {
      section: { en: null, fr: "Conventions collectives" },
      metier: true,
      description: { en: null, fr: "Liste(s) de la ou des convention(s) collective(s) rattachées à la certification" },
      tags: [".rncp[].numero", ".rncp[].libelle"],
      _: {
        rncp: {
          description: { en: null, fr: "Liste des conventions collectives issue de France Compétences." },
          notes: { en: null, fr: "- `null` lorsque le champs `identifiant.rncp` est `null`." },
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
