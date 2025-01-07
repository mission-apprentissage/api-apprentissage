import type { ICommune, IOrganisme } from "api-alternance-sdk";
import { zOrganisme } from "api-alternance-sdk";
import { ParisDate } from "api-alternance-sdk/internal";
import type { IApiEntEtablissement, IApiEntUniteLegale } from "shared/models/cache/cache.entreprise.model";
import type { ISourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import {
  getEtablissementDiffusible,
  getSirenFromSiret,
  getUniteLegaleDiffusible,
} from "@/services/apis/entreprise/entreprise.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

type OrganismeBuilderContext = {
  etablissement: IApiEntEtablissement | null;
  uniteLegale: IApiEntUniteLegale;
  commune: ICommune | null;
};

export async function buildOrganismeContext(siret: string): Promise<OrganismeBuilderContext | null> {
  const [etablissement, uniteLegale] = await Promise.all([
    getEtablissementDiffusible(siret),
    getUniteLegaleDiffusible(getSirenFromSiret(siret)),
  ]);

  if (uniteLegale === null) {
    return null;
  }

  const codeCommune = etablissement?.adresse == null ? null : etablissement.adresse.code_commune;
  const commune = codeCommune === null ? null : await getDbCollection("commune").findOne({ "code.insee": codeCommune });

  return {
    etablissement,
    uniteLegale,
    commune,
  };
}

function getAdresse(context: OrganismeBuilderContext): IOrganisme["etablissement"]["adresse"] {
  if (context.etablissement === null || context.commune === null) {
    return null;
  }

  return {
    label: [
      context.etablissement.adresse.numero_voie,
      context.etablissement.adresse.indice_repetition_voie,
      context.etablissement.adresse.type_voie,
      context.etablissement.adresse.libelle_voie,
    ]
      .filter(Boolean)
      .join(" "),
    code_postal: context.etablissement.adresse.code_postal,
    commune: {
      code_insee: context.commune.code.insee,
      nom: context.commune.nom,
    },
    departement: {
      code_insee: context.commune.departement.codeInsee,
      nom: context.commune.departement.nom,
    },
    region: {
      code_insee: context.commune.region.codeInsee,
      nom: context.commune.region.nom,
    },
    academie: context.commune.academie,
  };
}

export function buildOrganisme(
  source: Pick<ISourceReferentiel["data"], "siret" | "uai" | "qualiopi" | "numero_declaration_activite">,
  context: OrganismeBuilderContext,
  statutReferentiel: IOrganisme["statut"]["referentiel"]
): IOrganisme {
  const data: IOrganisme = {
    identifiant: {
      siret: source.siret,
      uai: source.uai ?? null,
    },

    ...buildOrganismeEntrepriseParts(source.siret, context),
    renseignements_specifiques: {
      qualiopi: source.qualiopi ?? false,
      numero_activite: source.numero_declaration_activite ?? null,
    },

    statut: {
      referentiel: statutReferentiel,
    },
  };

  return zOrganisme.parse(data);
}

export function buildOrganismeEntrepriseParts(
  siret: string,
  context: OrganismeBuilderContext
): Pick<IOrganisme, "etablissement" | "unite_legale"> {
  const uniteLegale = {
    siren: context.uniteLegale.siren,
    actif: context.uniteLegale.etat_administratif === "A",
    raison_sociale: context.uniteLegale.personne_morale_attributs.raison_sociale ?? "",
    creation: new ParisDate(context.uniteLegale.date_creation ?? "1990-01-01"),
    cessation: context.uniteLegale.date_cessation === null ? null : new ParisDate(context.uniteLegale.date_cessation),
  };

  const data: Pick<IOrganisme, "etablissement" | "unite_legale"> = {
    etablissement: {
      siret,
      ouvert: context.etablissement?.etat_administratif === "A",
      enseigne: context.etablissement?.enseigne ?? null,
      adresse: getAdresse(context),
      // D'après l'API Entreprise: "Pour certains établissements très anciens, tous fermés et dont l’unité légale est cessée la date de création peut être nulle."
      // Dans ce cas, on fixe la date de création à 1990-01-01.
      creation: new ParisDate(context.etablissement?.date_creation ?? "1900-01-01"),
      fermeture:
        context.etablissement === null || context.etablissement.date_fermeture === null
          ? uniteLegale.cessation
          : new ParisDate(context.etablissement.date_fermeture),
    },

    unite_legale: uniteLegale,
  };

  return zOrganisme
    .pick({
      etablissement: true,
      unite_legale: true,
    })
    .parse(data);
}
