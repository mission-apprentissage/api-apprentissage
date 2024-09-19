import type { DocBusinessField } from "../../../../types.js";

export default <DocBusinessField>{
  metier: true,
  description:
    "**Un couple CFD-RNCP a une période de validité** qui correspond à l’intersection de la période d’ouverture du diplôme et de la période d’activité de la fiche RNCP.",
  information: null,
  sample: "exemple : du 01.09.2021 au 31.08.2026",
  tags: [".debut", ".fin"],
  notes: "Les dates sont retournées au format ISO 8601 avec le fuseau horaire Europe/Paris.",
  tip: null,
};
