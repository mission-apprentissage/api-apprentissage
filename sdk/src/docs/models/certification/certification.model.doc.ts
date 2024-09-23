import type { DataSource, DocModel } from "../../types.js";
import continuiteDesc from "./docs/continuite.description.md.js";
import continuiteRncpDesc from "./docs/continuite.rncp.description.md.js";
import continuiteRncpNotes from "./docs/continuite.rncp.notes.md.js";
import domainesDesc from "./docs/domaines.description.md.js";
import identifiantCfdNotes from "./docs/identifiant.cfd.notes.md.js";
import identifiantInfo from "./docs/identifiant.information.md.js";
import identifiantRncpNotes from "./docs/identifiant.rncp.notes.md.js";
import identiantRncpAnterieur2019Notes from "./docs/identifiant.rncp_anterieur_2019.notes.md.js";
import identifiantTip from "./docs/identifiant.tip.md.js";
import intituleDesc from "./docs/intitule.description.md.js";
import intituleNiveauTip from "./docs/intitule.niveau.tip.md.js";
import periodeValiditeCfdDesc from "./docs/periode_validite.cfd.description.md.js";
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
        },
        rncp: {
          description: "Code Répertoire National des Certifications Professionnelles (RNCP) de la certification.",
          notes: identifiantRncpNotes,
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
        },
        fin: {
          description:
            "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
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
            },
            fermeture: {
              description: "Date de fermeture du diplôme.",
              notes:
                "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
            },
            premiere_session: {
              description: "Année de sortie des premiers diplômés.",
            },
            derniere_session: {
              description: "Année de sortie des derniers diplômés.",
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
              notes: [
                "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
                "- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
              ].join("\n\n"),
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
          description: "",
          _: {
            court: {
              description: "",
            },
            long: {
              description: "",
            },
          },
        },
        rncp: {
          description: "",
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
              description: "",
              _: {
                sigle: {
                  description: "",
                },
                europeen: {
                  description: "",
                },
                formation_diplome: {
                  description: "",
                },
                libelle: {
                  description: "",
                },
                interministeriel: {
                  description: "",
                },
              },
            },
            rncp: {
              description: "",
              _: {
                europeen: {
                  description: "",
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
          description: "",
          _: {
            "[]": {
              description: "",
              _: {
                ouverture: {
                  description: "",
                },
                fermeture: {
                  description: "",
                },
                code: {
                  description: "",
                },
                courant: {
                  description: "",
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
              description: "",
              _: {
                activation: {
                  description: "",
                },
                fin_enregistrement: {
                  description: "",
                },
                code: {
                  description: "",
                },
                courant: {
                  description: "",
                },
                actif: {
                  description: "",
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
          description: "",
          _: {
            "[]": {
              description: "",
              _: {
                code: {
                  description: "",
                },
                intitule: {
                  description: "",
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
          description: "",
          _: {
            cfd: {
              description: "",
              _: {
                "[]": {
                  description: "",
                  _: {
                    code: {
                      description: "",
                    },
                    intitule: {
                      description: "",
                    },
                  },
                },
              },
            },
            rncp: {
              description: "",
              _: {
                "[]": {
                  description: "",
                  _: {
                    code: {
                      description: "",
                    },
                    intitule: {
                      description: "",
                    },
                  },
                },
              },
            },
          },
        },
        rome: {
          description: "",
          _: {
            rncp: {
              description: "",
              _: {
                "[]": {
                  description: "",
                  _: {
                    code: {
                      description: "",
                    },
                    intitule: {
                      description: "",
                    },
                  },
                },
              },
            },
          },
        },
        formacodes: {
          description: "",
          _: {
            rncp: {
              description: "",
              _: {
                "[]": {
                  description: "",
                  _: {
                    code: {
                      description: "",
                    },
                    intitule: {
                      description: "",
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
          description: "",
          _: {
            cfd: {
              description: "",
              _: {
                code: {
                  description: "",
                },
                libelle: {
                  description: "",
                },
              },
            },
          },
        },
        gestionnaire_diplome: {
          description: "",
        },
        enregistrement_rncp: {
          description: "",
        },
        voie_acces: {
          description: "",
          _: {
            rncp: {
              description: "",
              _: {
                apprentissage: {
                  description: "",
                },
                experience: {
                  description: "",
                },
                candidature_individuelle: {
                  description: "",
                },
                contrat_professionnalisation: {
                  description: "",
                },
                formation_continue: {
                  description: "",
                },
                formation_statut_eleve: {
                  description: "",
                },
              },
            },
            certificateurs_rncp: {
              description: "",
              _: {
                "[]": {
                  description: "",
                  _: {
                    siret: {
                      description: "",
                    },
                    nom: {
                      description: "",
                    },
                  },
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
          description: "",
          _: {
            creation: {
              description: "",
            },
            abrogation: {
              description: "",
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
          description: "",
        },
        "rncp[]": {
          description: "",
        },
        "rncp[].numero": {
          description: "",
        },
        "rncp[].intitule": {
          description: "",
        },
      },
    },
  },
} as const satisfies DocModel;
