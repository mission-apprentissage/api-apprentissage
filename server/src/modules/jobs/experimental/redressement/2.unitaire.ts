import { getDbCollection } from "../../../../common/utils/mongodbUtils";
import { PrerequisiteResult } from "./1.prerequisite";

export async function rechercheOrganismesReferentiel(
  pre: PrerequisiteResult,
  _options?: { date: Date | undefined }
): Promise<any> {
  const couple = { uai: pre.uai, siret: pre.siret };

  const rorDbResults = await getDbCollection("source.referentiel")
    .find({ $or: [{ "data.siret": couple.siret }, { "data.uai": couple.uai }] })
    .toArray();

  if (!rorDbResults.length) {
    return {
      rule: "ROR9", // Aucun organisme n'existe dans le referentiel
    };
  }

  const rorDbResultsExtact = rorDbResults.filter(({ data }) => data.siret === couple.siret && data.uai === couple.uai);

  if (!rorDbResultsExtact.length) {
    return {
      rule: "ROR8",
      referentiel: rorDbResults.map(({ _id, data }) => ({
        _id,
        nature: data.nature,
        uai: data.uai,
        siret: data.siret,
      })),
    };
  }

  if (rorDbResults.length !== rorDbResultsExtact.length) {
    return {
      rule: "ROR10",
      // TODO TBD
      referentiel: rorDbResults.map(({ _id, data }) => ({
        _id,
        nature: data.nature,
        uai: data.uai,
        siret: data.siret,
      })),
    };
  }

  const rorDbResultsExtactNature = rorDbResultsExtact.filter(({ data }) => data.nature && data.nature !== "inconnue");

  if (!rorDbResultsExtactNature.length) {
    return {
      rule: "ROR11",
      referentiel: rorDbResultsExtact.map(({ _id, data }) => ({
        _id,
        nature: data.nature,
        uai: data.uai,
        siret: data.siret,
      })),
    };
  }

  if (rorDbResultsExtactNature.length > 1) {
    return {
      rule: "ROR12",
      referentiel: rorDbResultsExtactNature.map(({ _id, data }) => ({
        _id,
        nature: data.nature,
        uai: data.uai,
        siret: data.siret,
      })),
    };
  }

  // rorDbResultsExtactNature.length === 1
  const [match] = rorDbResultsExtactNature;
  const previousRules = pre.rules.at(-1);

  if (match.data.etat_administratif === "fermé" && (previousRules === "PC1" || previousRules === "PC3")) {
    return {
      rule: "ROR5",
      referentiel: [
        {
          _id: match._id,
          nature: match.data.nature,
          uai: match.data.uai,
          siret: match.data.siret,
        },
      ],
      nature: match.data.nature,
    };
  }

  return {
    rule: previousRules?.replace("PC", "ROR"), // ROR1,ROR2,ROR3,ROR4
    referentiel: [
      {
        _id: match._id,
        nature: match.data.nature,
        uai: match.data.uai,
        siret: match.data.siret,
      },
    ],
    nature: match.data.nature,
  };
}

export async function rechercheLieuxReferentiel(uai: string, _options?: { date: Date | undefined }): Promise<any> {
  const dbResult = await getDbCollection("source.referentiel")
    .find(
      { "data.lieux_de_formation.uai": uai },
      {
        projection: {
          _id: 1,
          "data.nature": 1,
          "data.lieux_de_formation.code": 1,
          "data.lieux_de_formation.siret": 1,
          "data.lieux_de_formation.uai": 1,
          "data.lieux_de_formation.uai_fiable": 1,
          "data.lieux_de_formation.adresse.code_postal": 1,
          "data.lieux_de_formation.adresse.code_insee": 1,
          "data.lieux_de_formation.adresse.localite": 1,
          "data.lieux_de_formation.adresse.departement": 1,
          "data.lieux_de_formation.adresse.region": 1,
          "data.lieux_de_formation.adresse.academie": 1,
          "data.lieux_de_formation.adresse.geojson.geometry.coordinates": 1,
        },
      }
    )
    .toArray();

  if (!dbResult.length) {
    return {
      rule: "RLR3",
    };
  }

  if (dbResult.length > 1) {
    return {
      rule: "RLR4",
      referentiel: dbResult.map(({ _id, data }) => ({ _id, nature: data.nature })), // TODO lieu
    };
  }

  //dbResult.length === 1
  const [match] = dbResult;
  // TODO check uai_fiable === false

  const lieux = match.data.lieux_de_formation.filter((l) => {
    return l.uai === uai;
  });

  if (lieux.length !== 1) {
    return {
      rule: "RLR2", // TODO
    };
  }

  // @ts-expect-error
  const [lon, lat] = lieux[0].adresse?.geojson?.geometry.coordinates || [0, 0];
  const { geojson: _, ...lieuxAdress } = lieux[0]?.adresse || {};

  // TODO Check uniq adress + PC1 et PC2

  return {
    rule: "RLR1",
    referentiel: [
      {
        _id: match._id,
        nature: match.data.nature,
        // TODO SIRET uai
        lieu: {
          ...lieux[0],
          adresse: {
            ...lieuxAdress,
            lon,
            lat,
          },
        },
      },
    ],
    nature: "lieux_de_formation",
  };
}

export async function rechercheCatalogue(
  pre: PrerequisiteResult,
  options?: { date: Date | undefined; certification: string | undefined }
): Promise<any> {
  const couple = { uai: pre.uai, siret: pre.siret };
  const dbResult = await getDbCollection("source.catalogue")
    .find(
      {
        $or: [
          { "data.etablissement_gestionnaire_siret": couple.siret },
          { "data.etablissement_formateur_siret": couple.siret },
        ],
      },
      {
        projection: {
          "data.cle_ministere_educatif": 1,
          "data.cfd": 1,
          "data.rncp_code": 1,
          "data.lieu_formation_geo_coordonnees": 1,
          "data.lieu_formation_geopoint": 1,
          "data.lieu_formation_adresse": 1,
          "data.tags": 1,
          "data.etablissement_formateur_siret": 1,
          "data.etablissement_formateur_uai": 1,
          "data.etablissement_gestionnaire_siret": 1,
          "data.etablissement_gestionnaire_uai": 1,
        },
      }
    )
    .toArray();

  if (!dbResult.length) {
    return {
      rule: "RC3", // No Match
      result: [],
    };
  }

  const catalogueResults = dbResult.map(
    ({
      data: {
        cle_ministere_educatif,
        cfd,
        rncp_code,
        lieu_formation_geo_coordonnees,
        lieu_formation_geopoint,
        lieu_formation_adresse,
        tags,
        etablissement_formateur_siret,
        etablissement_formateur_uai,
        etablissement_gestionnaire_siret,
        etablissement_gestionnaire_uai,
      },
    }) => {
      // @ts-expect-error
      const [lon, lat] = lieu_formation_geopoint || [0, 0];
      return {
        cle_ministere_educatif,
        cfd,
        rncp: rncp_code,
        tags,
        responsable: {
          siret: etablissement_gestionnaire_siret,
          uai: etablissement_gestionnaire_uai,
        },
        formateur: {
          siret: etablissement_formateur_siret,
          uai: etablissement_formateur_uai,
        },
        lieu: {
          geo_coordonnees: lieu_formation_geo_coordonnees,
          lon,
          lat,
          adresse: lieu_formation_adresse,
        },
      };
    }
  );

  if (options?.certification) {
    const certificationResults = catalogueResults.filter((result) => result.cfd === options.certification); // TODO rncp
    if (!certificationResults.length) {
      return {
        rule: "RC4",
        result: catalogueResults,
      };
    }
    if (certificationResults.length === 1) {
      return {
        rule: "RC1",
        result: certificationResults[0],
      };
    }

    return {
      rule: "RC2",
      result: certificationResults,
    };
  }

  return {
    rule: "RC4",
    result: catalogueResults,
  };
}
