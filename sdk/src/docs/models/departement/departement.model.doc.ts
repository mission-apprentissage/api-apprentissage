import type { DataSource, DocModel } from "../../types.js";
import { communeModelDoc } from "../commune/commune.model.doc.js";

const sources: DataSource[] = [
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
];

export const departementModelDoc = {
  name: "Departement",
  description: { en: null, fr: "Département" },
  sources,
  sections: {
    department: {
      name: communeModelDoc.sections.departement.name,
      _: communeModelDoc.sections.departement._.departement._,
    },
    region: communeModelDoc.sections.region,
    academie: communeModelDoc.sections.academie,
  },
} as const satisfies DocModel;
