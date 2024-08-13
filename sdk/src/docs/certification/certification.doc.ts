import { DataSource, DocDictionary } from "../types.js";
import { identifiantTopologie } from "./00_identifiant/index.js";
import { periodeValiditeTopologie } from "./01_periode_validite/index.js";
import { intituleTopologie } from "./02_intitule/index.js";
import { continuiteTopologie } from "./03_continuite/index.js";
import { blocsCompetencesTopologie } from "./04_blocs_competences/index.js";
import { domainesTypologie } from "./05_domaines/index.js";
import { typeTypologie } from "./06_type/index.js";
import { baseLegaleTopologie } from "./07_base_legale/index.js";
import { conventionsCollectivesTopologie } from "./08_conventions_collectives/index.js";

export const certificationDoc = {
  identifiantTopologie,
  periodeValiditeTopologie,
  intituleTopologie,
  blocsCompetencesTopologie,
  domainesTypologie,
  typeTypologie,
  continuiteTopologie,
  baseLegaleTopologie,
  conventionsCollectivesTopologie,
} as const satisfies DocDictionary;

export const certificationSources: DataSource[] = [
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
