import type { DocPage, OpenApiText } from "../../types.js";
import continuiteDescFr from "./fr/continuite.description.md.js";
import domainesDescFr from "./fr/domaines.description.md.js";
import identifiantInfoFr from "./fr/identifiant.information.md.js";
import identifiantTipFr from "./fr/identifiant.tip.md.js";
import intituleDescFr from "./fr/intitule.description.md.js";
import intituleNiveauTipFr from "./fr/intitule.niveau.tip.md.js";
import periodeValiditeCfdDescFr from "./fr/periode_validite.cfd.description.md.js";
import periodeValiditeRncpDescFr from "./fr/periode_validite.rncp.description.md.js";
import typeDesc from "./fr/type.description.md.js";

export const certificationsPageSummaryDoc = {
  title: {
    fr: "Liste des certifications professionnelles",
    en: "List of professional certifications",
  },
  headline: {
    en: "Consult the data model and search the list of certifications",
    fr: "Consulter le modèle de données et effectuer une recherche dans la liste des certifications",
  },
} as const satisfies { title: OpenApiText; headline: OpenApiText };

export const certificationsPageDoc = {
  tag: "certifications",
  operationIds: ["getCertifications"],
  habilitation: null,
  description: [
    {
      en: "**Use a reliable and enriched dataset for your project:** coding, validity period, title, fields, continuity, type, and legal basis.",
      fr: "**Utilisez un jeu de données fiable et enrichi pour votre projet :** codification, période de validité, intitulé, domaines, continuité, type et base légale.",
    },
  ],
  frequenceMiseAJour: "daily",
  type: "data",
  sources: [
    {
      name: "Répertoire National des Certifications Professionnelles (RNCP)",
      logo: { href: "/asset/logo/france_competences.png" },
      providers: ["France Compétences (FC)"],
      href: "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-certifications-professionnelles-et-repertoire-specifique/",
    },
    {
      name: "Base Centrale des Nomenclatures (BCN)",
      logo: { href: "/asset/logo/education_nationale.png" },
      providers: ["Éducation nationale (EN)"],
      href: "https://infocentre.pleiade.education.fr/bcn/index.php/domaine/voir/id/45",
    },
    {
      name: "Kit apprentissage (sur demande)",
      logo: { href: "/asset/logo/carif-oref-onisep.png" },
      providers: ["Réseau des carif-oref (RCO)", "Onisep"],
      href: "https://www.intercariforef.org/blog/communique-de-presse-france-competences-onisep-rco",
    },
  ],
  data: [
    {
      name: {
        en: "Certification",
        fr: "Certification",
      },
      sections: {
        identifiant: {
          name: { en: null, fr: "Identifiant" },
          rows: {
            identifiant: {
              description: {
                en: null,
                fr: "**Une certification correspond à un couple CFD-RNCP sur une période donnée.** Le Code Formation Diplôme (CFD) ou code scolarité référence la certification dans la Base Centrale des Nomenclature. Le code RNCP référence la certification dans le Répertoire National des Certifications Professionnelles.",
              },
              information: { en: null, fr: identifiantInfoFr },
              sample: { en: null, fr: "exemple : La certification correspond au couple CFD 50022137 - RNCP37537" },
              tags: [".cfd", ".rncp", ".rncp_anterieur_2019"],
              tip: {
                title: { en: null, fr: "structure des codes CFD et RNCP" },
                content: { en: null, fr: identifiantTipFr },
              },
            },
          },
        },
        periode_validite: {
          name: { en: null, fr: "Période de validité" },
          rows: {
            periode_validite: {
              description: {
                en: null,
                fr: "**Un couple CFD-RNCP a une période de validité** qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
              },
              sample: { en: null, fr: "exemple : du 01.09.2021 au 31.08.2026" },
              tags: [".debut", ".fin"],
            },
            cfd: {
              description: { en: null, fr: periodeValiditeCfdDescFr },
              tags: [".ouverture", ".fermeture", ".premiere_session", ".derniere_session"],
            },
            rncp: {
              description: { en: null, fr: periodeValiditeRncpDescFr },
              information: {
                en: null,
                fr: "Un enregistrement au RNCP est pour une durée maximale de 5 ans, passé ce délai toute fiche doit faire l’objet d’une demande de renouvellement.",
              },
              tags: [".actif", ".activation", ".debut_parcours", ".fin_enregistrement"],
            },
          },
        },
        intitule: {
          name: { en: null, fr: "Intitulé" },
          rows: {
            intitule: {
              description: { en: null, fr: intituleDescFr },
              sample: { en: null, fr: "exemple : Boulanger" },
              tags: [".cfd.court", ".cfd.long", ".rncp"],
            },
            niveau: {
              description: { en: null, fr: "Niveau de qualification de la certification professionnelle." },
              sample: { en: null, fr: "exemple : CAP et/ou Niveau 3" },
              tags: [".cfd.sigle", ".cfd.europeen", ".cfd.formation_diplome", ".cfd.libelle"],
              tip: {
                title: { en: null, fr: "équivalence des niveaux" },
                content: { en: null, fr: intituleNiveauTipFr },
              },
            },
          },
        },
        continuite: {
          name: { en: null, fr: "Continuité" },
          rows: {
            continuite: {
              description: { en: null, fr: continuiteDescFr },
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
            },
          },
        },
        blocs_competences: {
          name: { en: null, fr: "Blocs de compétences" },
          rows: {
            blocs_competences: {
              description: {
                en: null,
                fr: "Liste du(des) code(s) et intitulé(s) des blocs de compétences validés par la certification.",
              },
              tags: [".rncp[].code", ".rncp[].intitule"],
            },
          },
        },
        domaines: {
          name: { en: null, fr: "Domaines" },
          rows: {
            domaines: {
              description: { en: null, fr: domainesDescFr },
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
            },
          },
        },
        type: {
          name: { en: null, fr: "Type" },
          rows: {
            type: {
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
            },
          },
        },
        base_legale: {
          name: { en: null, fr: "Base légale" },
          rows: {
            base_legale: {
              description: { en: null, fr: "Dates de création et d’abrogation des diplômes créés par arrêtés." },
              tags: [".cfd.creation", ".cfd.abrogation"],
            },
          },
        },
        convention_collectives: {
          name: { en: null, fr: "Convention collectives" },
          rows: {
            convention_collectives: {
              description: {
                en: null,
                fr: "Liste des conventions collectives rattachées à la certification.",
              },
              tags: [".rncp[].numero", ".rncp[].libelle"],
            },
          },
        },
      },
    },
  ],
} as const satisfies DocPage;
