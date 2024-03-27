import { getDbCollection } from "@/services/mongodb/mongodbService";

import { fetchFormationCatalogueEducatif } from "../../../services/apis/catalogue/catalogueEducatif";
import { PrerequisiteResult } from "./1.prerequisite";

export async function rechercheOrganismesReferentiel(
  pre: PrerequisiteResult,
  _options?: { date: Date | undefined }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      organismes: rorDbResults.map(({ _id, data }) => ({
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
      organismes: rorDbResultsExtact.map(({ _id, data }) => ({
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
      organismes: rorDbResultsExtactNature.map(({ _id, data }) => ({
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
      organismes: [
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
    organismes: [
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function rechercheLieuxReferentiel(uai: string, _options?: { date: Date | undefined }): Promise<any> {
  const dbResult = await getDbCollection("source.referentiel")
    .find(
      { "data.lieux_de_formation.uai": uai },
      {
        projection: {
          _id: 1,
          "data.nature": 1,
          "data.uai": 1,
          "data.siret": 1,
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
      organismes: dbResult.map(({ _id, data }) => {
        const lieux_de_formation = data.lieux_de_formation.filter((l) => {
          return l.uai === uai;
        });
        return { _id, nature: data.nature, uai: data.uai, siret: data.siret, lieux_de_formation };
      }),
    };
  }

  //dbResult.length === 1
  const [match] = dbResult;

  const lieux = match.data.lieux_de_formation.filter((l) => {
    return l.uai === uai;
  });

  if (lieux.length !== 1) {
    return {
      rule: "RLR2", // TODO
      organismes: dbResult.map(({ _id, data }) => {
        return { _id, nature: data.nature, uai: data.uai, siret: data.siret, lieux_de_formation: lieux };
      }),
    };
  }

  // @ts-expect-error
  const [lon, lat] = lieux[0].adresse?.geojson?.geometry.coordinates || [0, 0];
  const { geojson: _, ...lieuxAdress } = lieux[0]?.adresse || {};

  const sameLocalisation = match.data.lieux_de_formation.filter((l) => {
    return l.code === lieux[0].code;
  });

  if (sameLocalisation.length !== 1) {
    return {
      rule: "RLR5",
      organismes: [
        {
          _id: match._id,
          nature: match.data.nature,
          uai: match.data.uai,
          siret: match.data.siret,
        },
      ],
      lieux_de_formation: {
        ...lieux[0],
        adresse: {
          ...lieuxAdress,
          lon,
          lat,
        },
      },
      nature: "lieux_de_formation",
    };
  }

  return {
    rule: "RLR1",
    organismes: [
      {
        _id: match._id,
        nature: match.data.nature,
        uai: match.data.uai,
        siret: match.data.siret,
      },
    ],
    lieux_de_formation: {
      ...lieux[0],
      adresse: {
        ...lieuxAdress,
        lon,
        lat,
      },
    },
    nature: "lieux_de_formation",
  };
}

export async function rechercheCatalogue(
  pre: PrerequisiteResult,
  options?: { date: Date | undefined; certification: string | undefined }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const couple = { uai: pre.uai, siret: pre.siret };
  const dbResults = await getDbCollection("source.catalogue")
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

  if (!dbResults.length) {
    return {
      rule: "RC3", // No Match
      result: [],
    };
  }

  const catalogueResults = [];
  for (const {
    data: {
      cle_ministere_educatif,
      cfd,
      rncp_code,
      lieu_formation_geo_coordonnees,
      lieu_formation_adresse,
      tags,
      etablissement_formateur_siret,
      etablissement_formateur_uai,
      etablissement_gestionnaire_siret,
      etablissement_gestionnaire_uai,
    },
  } of dbResults) {
    const [lat, lon] = lieu_formation_geo_coordonnees?.split(",") || [0, 0];
    const nature_pour_cette_formation = [];
    if (etablissement_gestionnaire_siret === couple.siret) nature_pour_cette_formation.push("responsable");
    if (etablissement_formateur_siret === couple.siret) nature_pour_cette_formation.push("formateur");

    const { uai_formation } = await fetchFormationCatalogueEducatif(cle_ministere_educatif);

    catalogueResults.push({
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
        ...(uai_formation ? { uai: uai_formation } : {}),
        geo_coordonnees: lieu_formation_geo_coordonnees,
        lon,
        lat,
        adresse: lieu_formation_adresse,
      },
    });
  }

  if (options?.certification) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certificationResults = catalogueResults.filter((result: any) => result.cfd === options.certification); // TODO rncp
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
    rule: "RC5",
    result: catalogueResults,
  };
}
