import { ISourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import config from "@/config";

import getApiClient from "../client";

// Cf Documentation : https://referentiel.apprentissage.onisep.fr/api/v1/doc/#/

const referentielClient = getApiClient(
  {
    baseURL: config.api.referentielOnisep.endpoint,
  },
  { cache: false }
);

/**
 * Récupération des organismes du référentiel
 * Par défaut on récupère 50000 éléments par page et tous les champs
 */
export const fetchReferentielOrganismes = async () => {
  // https://referentiel.apprentissage.onisep.fr/api/v1/organismes.json?items_par_page=10&ordre=desc
  const {
    data: { organismes },
  } = await referentielClient.get<{ organismes: ISourceReferentiel[] }>("/organismes.json", {
    params: {
      items_par_page: 60000,
    },
  });

  // TODO Outside not here
  // // comme le référentiel n'expose pas l'UAI directement dans les relations mais seulement le SIRET,
  // // on complète l'UAI des relations avec l'UAI stockées dans les organismes
  // const uaiBySiret = organismes.reduce((acc, organisme) => {
  //   acc[organisme.siret] = organisme.uai;
  //   return acc;
  // }, {});

  // organismes.forEach((organisme) => {
  //   organisme?.relations?.forEach((relation) => {
  //     if (relation.siret) {
  //       relation.uai = uaiBySiret[relation.siret];
  //     }
  //   });
  // });

  return organismes;
};
