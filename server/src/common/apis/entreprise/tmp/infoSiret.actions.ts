import { captureException } from "@sentry/node";
import { validateSIRET } from "shared/helpers/zodHelpers/siretValidator";

import { ApiEntEtablissement, getEtablissementDiffusible } from "@/common/apis/entreprise/entreprise";
import logger from "@/common/logger";

import { buildAdresse, findDataByDepartementNum, getDepartementCodeFromCodeInsee } from "./adresseUtils";
import { InfoSiret } from "./infoSiret.actions-struct";

export const findDataFromSiret = async (providedSiret: string): Promise<InfoSiret> => {
  if (!providedSiret || !validateSIRET(providedSiret.trim())) {
    return {
      result: null,
      error: {
        message: `Le Siret ${providedSiret} n'est pas valide, un Siret doit être défini et au format 14 caractères`,
      },
    };
  }

  const siret = `${providedSiret}`.trim();

  let etablissementApiInfo: ApiEntEtablissement;
  try {
    etablissementApiInfo = await getEtablissementDiffusible(siret);
  } catch (e: any) {
    logger.error(e);
    if (e.reason === 451) {
      return {
        result: null,
        error: {
          message: `Le Siret ${siret} existe mais est indisponible pour raisons légales`,
          secret_siret: true,
        },
      };
    } else if (/^5[0-9]{2}/.test(`${e.reason}`)) {
      captureException(e);
      return {
        result: null,
        error: {
          message: "Le service de récupération des informations Siret est momentanément indisponible",
          api_entreprise_status: "KO",
        },
      };
    }
    return {
      result: null,
      error: {
        message: `Le Siret ${siret} n'existe pas ou n'a été retrouvé`,
      },
    };
  }

  const code_dept = getDepartementCodeFromCodeInsee(etablissementApiInfo.adresse.code_commune);
  const { code_region, num_academie } = findDataByDepartementNum(code_dept);

  return {
    result: {
      ...etablissementApiInfo,
      siret: etablissementApiInfo.siret,
      naf_code: etablissementApiInfo.activite_principale.code,
      enseigne: etablissementApiInfo.enseigne?.trim(),
      raison_sociale: etablissementApiInfo.unite_legale?.personne_morale_attributs?.raison_sociale,
      adresse: buildAdresse(etablissementApiInfo.adresse?.acheminement_postal),
      ...(etablissementApiInfo.adresse.numero_voie
        ? { numero_voie: parseInt(etablissementApiInfo.adresse.numero_voie, 10) }
        : {}),
      type_voie: etablissementApiInfo.adresse.type_voie,
      nom_voie: etablissementApiInfo.adresse.libelle_voie,
      voie_complete: (etablissementApiInfo.adresse.type_voie ?? "") + (etablissementApiInfo.adresse.libelle_voie ?? ""),
      complement_adresse: etablissementApiInfo.adresse.complement_adresse,
      code_postal: etablissementApiInfo.adresse.code_postal,
      code_insee_localite: etablissementApiInfo.adresse.code_commune,
      num_departement: code_dept,
      num_region: code_region ?? "",
      num_academie: num_academie ?? "",
      localite: etablissementApiInfo.adresse.libelle_commune,
      ferme: etablissementApiInfo.etat_administratif !== "A",
      tranche_effectif_salarie_etablissement: etablissementApiInfo.tranche_effectif_salarie_etablissement,
    },
  };
};
