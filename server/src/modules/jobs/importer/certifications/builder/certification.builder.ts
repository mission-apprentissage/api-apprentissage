import { ICertification } from "shared/models/certification.model";
import { IBcn_V_FormationDiplome } from "shared/models/source/bcn/bcn.v_formation_diplome.model";
import { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { ISourceKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";

import { buildCertificationCfd, INiveauInterministerielSearchMap } from "./certification.cfd.builder";
import { buildCertificationPeriodeValidite } from "./certification.periode_validite.builder";
import { buildCertificationRncp } from "./certification.rncp.builder";

export type ISourceAggregatedData = {
  bcn?: IBcn_V_FormationDiplome | null;
  kit_apprentissage?: ISourceKitApprentissage | null;
  france_competence: ISourceFranceCompetence | null;
};

export function buildCertification(
  data: ISourceAggregatedData,
  oldestFranceCompetenceDatePublication: Date,
  niveauInterministerielSearchMap: INiveauInterministerielSearchMap
): Omit<ICertification, "_id" | "created_at" | "updated_at"> {
  const code = {
    cfd: data.bcn?.data.FORMATION_DIPLOME || null,
    rncp: data.france_competence?.numero_fiche || null,
  };
  const cfd = buildCertificationCfd(data.bcn, niveauInterministerielSearchMap);
  const rncp = buildCertificationRncp(
    data.france_competence,
    oldestFranceCompetenceDatePublication,
    niveauInterministerielSearchMap
  );

  return {
    code,
    periode_validite: buildCertificationPeriodeValidite(cfd, rncp),
    cfd,
    rncp,
  };
}
