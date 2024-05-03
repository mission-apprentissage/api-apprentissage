import { DocDictionary } from "../types";
import { identifiantTopologie } from "./00_identifiant";
import { periodeValiditeTopologie } from "./01_periode_validite";
import { intituleTopologie } from "./02_intitule";
import { blocsCompetencesTopologie } from "./03_blocs_competences";
import { domainesTypologie } from "./04_domaines";
import { typeTypologie } from "./05_type";
import { continuiteTopologie } from "./06_continuite";
import { baseLegaleTopologie } from "./07_base_legale";
import { conventionsCollectivesTopologie } from "./08_conventions_collectives";

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
