import { ICertification, zCertification } from "api-alternance-sdk";
import { IBcn_N_FormationDiplome } from "shared/models/source/bcn/bcn.n_formation_diplome.model";
import { IBcn_N51_FormationDiplome } from "shared/models/source/bcn/bcn.n51_formation_diplome.model";
import { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";

import { buildCertificationBaseLegale } from "./base_legale/certification.base_legale.builder.js";
import { buildCertificationBlocsCompetences } from "./blocs_competences/certification.blocs_competences.builder.js";
import { buildCertificationConventionCollectives } from "./convention_collectives/certification.convention_collectives.builder.js";
import { buildCertificationDomaines } from "./domaines/certification.domaines.builder.js";
import { buildCertificationIntitule } from "./intitule/certification.intitule.builder.js";
import { buildCertificationPeriodeValidite } from "./periode_validite/certification.periode_validite.builder.js";
import { buildCertificationType } from "./type/certification.type.builder.js";

export type ISourceAggregatedData = {
  bcn?: IBcn_N51_FormationDiplome | IBcn_N_FormationDiplome | null;
  france_competence?: ISourceFranceCompetence | null;
};

function isRncpAnterieur2019(rncp: string | null): boolean | null {
  if (rncp === null) {
    return null;
  }

  const numero = parseInt(rncp.substring(4));
  return numero < 34000;
}

export function buildCertification(
  data: ISourceAggregatedData,
  oldestFranceCompetenceDatePublication: Date
): ICertification {
  const cfdCode = data.bcn?.data.FORMATION_DIPLOME || null;
  const rncpCode = data.france_competence?.numero_fiche || null;

  return zCertification.parse({
    identifiant: {
      cfd: cfdCode,
      rncp: rncpCode,
      rncp_anterieur_2019: isRncpAnterieur2019(rncpCode),
    },
    intitule: buildCertificationIntitule(data),
    base_legale: buildCertificationBaseLegale(data),
    blocs_competences: buildCertificationBlocsCompetences(data),
    convention_collectives: buildCertificationConventionCollectives(data),
    domaines: buildCertificationDomaines(data),
    periode_validite: buildCertificationPeriodeValidite(data, oldestFranceCompetenceDatePublication),
    type: buildCertificationType(data),
    continuite: { rncp: null, cfd: null },
  });
}
