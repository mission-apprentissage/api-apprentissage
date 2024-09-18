import type { DataSource, DocModel } from "../../types.js";
import identifiant from "./00_identifiant/index.js";
import periode_validite from "./01_periode_validite/index.js";
import intitule from "./02_intitule/index.js";
import continuite from "./03_continuite/index.js";
import blocs_competences from "./04_blocs_competences/index.js";
import domaines from "./05_domaines/index.js";
import typeSection from "./06_type/index.js";
import base_legale from "./07_base_legale/index.js";
import conventions_collectives from "./08_conventions_collectives/index.js";

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
  sections: [
    identifiant,
    periode_validite,
    intitule,
    continuite,
    blocs_competences,
    domaines,
    typeSection,
    base_legale,
    conventions_collectives,
  ],
  sources,
} as const satisfies DocModel;
