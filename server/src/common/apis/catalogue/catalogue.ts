import { type ReadStream } from "node:fs";
import querystring from "node:querystring";

import { compose, transformData } from "oleoduc";

import logger from "@/common/logger";
import config from "@/config";

import { createJsonLineTransformStream } from "../../utils/streamUtils";
import getApiClient from "../client";

const catalogueClient = getApiClient(
  {
    baseURL: config.api.catalogue.baseurl,
  },
  { cache: false }
);

const neededFieldsFromCatalogue = {
  _id: 1,
  published: 1,
  catalogue_published: 1,
  intitule_long: 1,
  intitule_court: 1,
  niveau: 1,
  onisep_url: 1,
  parcoursup_id: 1,
  cle_ministere_educatif: 1,
  diplome: 1,
  cfd: 1,
  rncp_code: 1,
  rncp_intitule: 1,
  rncp_eligible_apprentissage: 1,
  capacite: 1,
  created_at: 1,
  last_update_at: 1,
  id_formation: 1,
  id_rco_formation: 1,
  email: 1,
  lieu_formation_adresse: 1,
  code_postal: 1,
  localite: 1,
  etablissement_formateur_nom_departement: 1,
  etablissement_formateur_courriel: 1,
  etablissement_formateur_adresse: 1,
  etablissement_formateur_complement_adresse: 1,
  etablissement_formateur_localite: 1,
  etablissement_formateur_code_postal: 1,
  etablissement_formateur_cedex: 1,
  etablissement_formateur_siret: 1,
  etablissement_formateur_id: 1,
  etablissement_formateur_uai: 1,
  etablissement_formateur_entreprise_raison_sociale: 1,
  etablissement_formateur_enseigne: 1,
  lieu_formation_geo_coordonnees: 1,
  num_departement: 1,
  region: 1,
  code_commune_insee: 1,
  rome_codes: 1,
  tags: 1,
  etablissement_gestionnaire_courriel: 1,
  etablissement_gestionnaire_adresse: 1,
  etablissement_gestionnaire_complement_adresse: 1,
  etablissement_gestionnaire_localite: 1,
  etablissement_gestionnaire_code_postal: 1,
  etablissement_gestionnaire_cedex: 1,
  etablissement_gestionnaire_entreprise_raison_sociale: 1,
  etablissement_gestionnaire_id: 1,
  etablissement_gestionnaire_uai: 1,
  etablissement_gestionnaire_siret: 1,
  etablissement_gestionnaire_type: 1,
  etablissement_gestionnaire_conventionne: 1,
  affelnet_statut: 1,
  entierement_a_distance: 1,
  contenu: 1,
  objectif: 1,
  date_debut: 1,
  date_fin: 1,
  modalites_entrees_sorties: 1,
  bcn_mefs_10: 1,
  num_tel: 1,
};

/**
 * @description Get formations count through the CARIF OREF catalogue API.
 * @returns {string}
 */
export const countFormations = async (): Promise<number | boolean> => {
  try {
    const response = await catalogueClient.get(`${config.api.catalogue.endpoints.formations}/count`);

    return response.data;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

/**
 * @description Get all formations through the CARIF OREF catalogue API.
 * @returns {Stream<Object[]>}
 */
export const getAllFormationsFromCatalogue = async () => {
  const now: Date = new Date();
  const tags: number[] = [now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + (now.getMonth() < 8 ? -1 : 2)];

  const count = (await countFormations()) ?? null;
  const query = { published: true, catalogue_published: true, tags: { $in: tags.map(String) } };

  if (!count) return;

  logger.debug(
    `${count} formation(s) à importer from ${config.api.catalogue.baseurl}${config.api.catalogue.endpoints.formations}.json`
  );

  const params = querystring.stringify({
    query: JSON.stringify(query),
    limit: count,
    select: JSON.stringify(neededFieldsFromCatalogue),
  });
  const response = await catalogueClient.get<ReadStream>(
    `${config.api.catalogue.endpoints.formations}.json?${params}`,
    {
      responseType: "stream",
    }
  );

  return compose(
    compose(
      response.data,
      transformData((d: any) => d.toString())
    ),
    createJsonLineTransformStream()
  );
};
