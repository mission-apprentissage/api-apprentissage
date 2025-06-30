import type { IFormation } from "api-alternance-sdk";
import { zFormation } from "api-alternance-sdk";
import type { ISourceCatalogue } from "shared/models/source/catalogue/source.catalogue.model";
import { z } from "zod/v4-mini";

import { buildFormationCertification } from "./certification.formation.builder.js";
import { buildFormationLieu } from "./lieu.formation.builder.js";
import { buildFormationModalite } from "./modalite.formation.builder.js";
import { buildFormationOrganisme } from "./organisme.formation.builder.js";
import { buildFormationSessions } from "./session.formation.builder.js";

export async function buildFormation(source: ISourceCatalogue): Promise<IFormation> {
  const [lieu, certification, formateur, responsable] = await Promise.all([
    buildFormationLieu(source.data),
    buildFormationCertification(source.data),
    buildFormationOrganisme({
      siret: source.data.etablissement_formateur_siret,
      uai: source.data.etablissement_formateur_uai,
    }),
    buildFormationOrganisme({
      siret: source.data.etablissement_gestionnaire_siret,
      uai: source.data.etablissement_gestionnaire_uai,
    }),
  ]);

  const modalite = buildFormationModalite(source.data);
  const sessions = buildFormationSessions(source.data, modalite);

  const data: IFormation = {
    identifiant: {
      cle_ministere_educatif: source.data.cle_ministere_educatif,
    },

    statut: {
      catalogue: source.data.published ? "publié" : "archivé",
    },

    formateur,

    responsable,

    certification,

    lieu,

    contact: {
      // Some emails are not valid
      email: z.string().check(z.email()).safeParse(source.data.email).success ? source.data.email : null,
      telephone: source.data.num_tel,
    },

    onisep: {
      // Some onisep are not valid URL
      url: z.string().check(z.url()).safeParse(source.data.onisep_url).success ? source.data.onisep_url : null,
      intitule: source.data.onisep_intitule,
      libelle_poursuite: source.data.onisep_libelle_poursuite,
      lien_site_onisepfr: source.data.onisep_lien_site_onisepfr,
      discipline: source.data.onisep_discipline,
      domaine_sousdomaine: source.data.onisep_domaine_sousdomaine,
    },

    modalite,

    contenu_educatif: {
      contenu: source.data.contenu ?? "",
      objectif: source.data.objectif ?? "",
    },

    sessions,
  };

  return zFormation.parse(data);
}
