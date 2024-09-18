import type { DocBusinessSection, DocTechnicalField } from "../../../types.js";
import periode_validiteCfd from "./periode_validite.cfd/index.js";
import periode_validiteRncp from "./periode_validite.rncp/index.js";
import periode_validite from "./periode_validite/index.js";

export default {
  name: "Période de validité",
  fields: {
    periode_validite: periode_validite,
    "periode_validite.debut": <DocTechnicalField>{
      type: "technical",
      description:
        "Date de début de validité de la certification. Cette date correspond à l'intersection de la date d'ouverture du diplôme et de la date d'activation de la fiche RNCP.",
      notes:
        "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
    },
    "periode_validite.fin": <DocTechnicalField>{
      type: "technical",
      description:
        "Date de fin de validité de la certification. Cette date correspond à l'intersection de la date de fermeture du diplôme et de la date de fin d'enregistrement.",
      notes: null,
    },
    "periode_validite.cfd": periode_validiteCfd,
    "periode_validite.cfd.ouverture": <DocTechnicalField>{
      type: "technical",
      description: "Date d'ouverture du diplôme.",
      notes:
        "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '00:00:00' sur le fuseau horaire 'Europe/Paris'.",
    },
    "periode_validite.cfd.fermeture": <DocTechnicalField>{
      type: "technical",
      description: "Date de fermeture du diplôme.",
      notes:
        "- La base centrale des nomenclatures (BCN) fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
    },
    "periode_validite.cfd.premiere_session": <DocTechnicalField>{
      type: "technical",
      description: "Année de sortie des premiers diplômés.",
      notes: null,
    },
    "periode_validite.cfd.derniere_session": <DocTechnicalField>{
      type: "technical",
      description: "Année de sortie des derniers diplômés.",
      notes: null,
    },
    "periode_validite.rncp": periode_validiteRncp,
    "periode_validite.cfd.actif": <DocTechnicalField>{
      type: "technical",
      description:
        "Lorsque la fiche est active, les inscriptions à la formation sont ouvertes, à l’inverse, lorsque la fiche est inactive, les inscriptions sont fermées.",
      notes: null,
    },
    "periode_validite.cfd.activation": <DocTechnicalField>{
      type: "technical",
      description: "Date à laquelle la fiche RNCP est passée au statut `actif`.",
      notes: [
        "- La couverture de ce champ est partiel car nous ne sommes pas en mesure pour le moment de récupérer les dates d'activation antérieures au 24 décembre 2021.",
        "- France Compétence ne fournie pas l'information, nous le déduisons de la date de premiere apparation de la fiche RNCP avec le statut `actif`.",
      ].join("\n\n"),
    },
    "periode_validite.cfd.debut_parcours": <DocTechnicalField>{
      type: "technical",
      description:
        "Date de début des parcours certifiants. Anciennement appelé 'date d'effet' pour les enregistrements de droit et correspondant à la date de décision pour les enregistrements sur demande.",
      notes: "La date est retournée au format ISO 8601 avec le fuseau horaire Europe/Paris.",
    },
    "periode_validite.cfd.fin_enregistrement": <DocTechnicalField>{
      type: "technical",
      description: "Date de fin d’enregistrement d’une fiche au RNCP.",
      notes:
        "- France Compétence fournie cette date sans l'information de l'heure, nous interprétons arbitrairement l'heure à '23:59:59' sur le fuseau horaire 'Europe/Paris'.",
    },
  },
} as const satisfies DocBusinessSection;
