import { ICertification, zCertification } from "shared/models/certification.model";
import { IBcn_V_FormationDiplome } from "shared/models/source/bcn/bcn.v_formation_diplome.model";
import { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { ISourceKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";

import { buildCertificationBaseLegale } from "./base_legale/certification.base_legale.builder";
import { buildCertificationBlocsCompetences } from "./blocs_competences/certification.blocs_competences.builder";
import { buildCertificationConventionCollectives } from "./convention_collectives/certification.convention_collectives.builder";
import { buildCertificationDomaines } from "./domaines/certification.domaines.builder";
import { buildCertificationIntitule } from "./intitule/certification.intitule.builder";
import { buildCertificationPeriodeValidite } from "./periode_validite/certification.periode_validite.builder";
import { buildCertificationType } from "./type/certification.type.builder";

export type ISourceAggregatedData = {
  bcn?: IBcn_V_FormationDiplome | null;
  kit_apprentissage?: ISourceKitApprentissage | null;
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
): Omit<ICertification, "_id" | "created_at" | "updated_at"> {
  const cfdCode = data.bcn?.data.FORMATION_DIPLOME || null;
  const rncpCode = data.france_competence?.numero_fiche || null;

  return zCertification
    .omit({
      _id: true,
      created_at: true,
      updated_at: true,
    })
    .parse({
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
    });
}
