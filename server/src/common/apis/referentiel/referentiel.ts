import { IReferentiel } from "shared/models/source/source.referentiel.model";

import config from "@/config";

import getApiClient from "../client";

// Cf Documentation : https://referentiel.apprentissage.onisep.fr/api/v1/doc/#/

const client = getApiClient(
  {
    baseURL: config.api.referentielOnisep.endpoint,
    timeout: 0, // no timeout
  },
  { cache: false }
);

/**
 * Récupération des organismes du référentiel
 * Par défaut on récupère 50000 éléments par page et tous les champs
 */
export const fetchReferentielOrganismes = async () => {
  const {
    data: { organismes },
  } = await client.get<{ organismes: IReferentiel[] }>("/organismes.json", {
    params: {
      items_par_page: 50000,
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
