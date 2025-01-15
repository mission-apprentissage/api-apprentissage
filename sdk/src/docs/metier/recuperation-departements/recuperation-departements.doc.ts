import type { DocPage, OpenApiText } from "../../types.js";
import { rechercheCommunePageDoc } from "../recherche-commune/recherche-commune.doc.js";

export const recuperationDepartementsPageSummaryDoc = {
  en: "Consult the list of departments in France",
  fr: "Consulter le référentiel des départements de France",
} as OpenApiText;

export const recuperationDepartementsPageDoc = {
  description: [{ en: "Retrieve the departments of France", fr: "Récupération des départements de France" }],
  frequenceMiseAJour: "daily",
  type: "data",
  emailDemandeHabilitations: null,
  sources: [
    {
      name: "API Découpage administratif",
      logo: { href: "/asset/logo/etalab.png" },
      providers: ["Etalab"],
      href: "https://geo.api.gouv.fr/decoupage-administratif",
    },
    {
      name: "API Métadonnées",
      logo: { href: "/asset/logo/insee.png" },
      providers: ["Institut national de la statistique et des études économiques (INSEE)"],
      href: "https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=M%C3%A9tadonn%C3%A9es&version=V1&provider=insee",
    },
    {
      name: "Référentiel géographique français, communes, unités urbaines, aires urbaines, départements, académies, régions",
      logo: { href: "/asset/logo/enseigne-sup.png" },
      providers: ["ministre de l'Enseignement supérieur et de la Recherche (MESR)"],
      href: "https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-referentiel-geographique/information/",
    },
  ],
  data: [
    {
      name: { en: null, fr: "Département" },
      sections: {
        departement: rechercheCommunePageDoc.data[0].sections.departement,
        region: rechercheCommunePageDoc.data[0].sections.region,
        academie: rechercheCommunePageDoc.data[0].sections.academie,
      },
    },
  ],
} as const satisfies DocPage;
