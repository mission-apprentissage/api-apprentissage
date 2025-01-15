import type { DocPage, OpenApiText } from "../../types.js";
import { rechercheCommunePageDoc } from "../recherche-commune/recherche-commune.doc.js";

export const recuperationMissionLocalePageSummaryDoc = {
  en: "Consult the list of Mission Locales",
  fr: "Consulter le référentiel des Missions Locales",
} as OpenApiText;

export const recuperationMissionLocalesPageDoc = {
  description: [{ en: "Retrieve the Mission Locales", fr: "Récupération des Missions Locales" }],
  frequenceMiseAJour: "daily",
  type: "data",
  emailDemandeHabilitations: null,
  sources: [
    {
      name: "Union Nationale des Missions Locales",
      logo: { href: "/asset/logo/unml.svg" },
      providers: ["Union Nationale des Missions Locales"],
      href: "https://www.unml.info/",
    },
  ],
  data: [
    {
      name: { en: null, fr: "Mission locale" },
      sections: {
        mission_locale: rechercheCommunePageDoc.data[0].sections.mission_locale,
      },
    },
  ],
} as const satisfies DocPage;
