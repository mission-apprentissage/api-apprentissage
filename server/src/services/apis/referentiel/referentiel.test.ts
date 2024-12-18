import nock from "nock";
import type { IOrganismeReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { describe, expect, it } from "vitest";

import { fetchReferentielOrganismes } from "./referentiel.js";

describe("fetchReferentielOrganismes", () => {
  const organismes: IOrganismeReferentiel[] = [
    {
      siret: "13002975400020",
      _meta: {
        anomalies: [],
        date_dernier_import: "2024-11-26T05:02:45.142Z",
        date_import: "2024-11-26T05:02:45.142Z",
        date_collecte: "2024-12-16T04:30:02.636Z",
        nouveau: false,
      },
      certifications: [
        {
          type: "rncp",
          code: "RNCP35944",
          label:
            "Sciences et techniques des activités physiques et sportives : activité physique adaptée et santé (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:21.176Z",
        },
        {
          type: "rncp",
          code: "RNCP35948",
          label: "Gestion et développement des organisations, des services sportifs et de loisirs (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:21.145Z",
        },
        {
          type: "rncp",
          code: "RNCP35949",
          label: "Métiers de la forme (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:17.057Z",
        },
        {
          type: "rncp",
          code: "RNCP35955",
          label: "Animation et gestion des activités physiques, sportives ou culturelles (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:20.745Z",
        },
        {
          type: "rncp",
          code: "RNCP38697",
          label: "STAPS : activité physique adaptée et santé (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.779Z",
        },
        {
          type: "rncp",
          code: "RNCP38698",
          label: "STAPS : entraînement et optimisation de la performance sportive (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.836Z",
        },
        {
          type: "rncp",
          code: "RNCP38700",
          label: "STAPS : management du sport (fiche nationale)",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.863Z",
        },
      ],
      contacts: [],
      diplomes: [
        {
          type: "cfd",
          code: "13533503",
          niveau: "135",
          label: "MASTER PRO",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.836Z",
        },
        {
          type: "cfd",
          code: "13533522",
          niveau: "135",
          label: "MASTER PRO",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.863Z",
        },
        {
          type: "cfd",
          code: "13533523",
          niveau: "135",
          label: "MASTER PRO",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.779Z",
        },
        {
          type: "cfd",
          code: "20533509",
          niveau: "205",
          label: "LIC LMD",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:21.176Z",
        },
        {
          type: "cfd",
          code: "25033517",
          niveau: "250",
          label: "LIC-PRO",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:21.145Z",
        },
        {
          type: "cfd",
          code: "25033521",
          niveau: "250",
          label: "LIC-PRO",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:17.057Z",
        },
        {
          type: "cfd",
          code: "35533513",
          niveau: "355",
          label: "DEUST",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:20.745Z",
        },
      ],
      lieux_de_formation: [
        {
          code: "3.08328_50.6118",
          adresse: {
            label: "15 Rue de l'Université 59790 Ronchin",
            code_postal: "59790",
            code_insee: "59507",
            localite: "Ronchin",
            geojson: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [3.083462, 50.611552],
              },
              properties: {
                score: 0.9999996303144683,
                source: "geo-adresse-api",
              },
            },
            departement: {
              code: "59",
              nom: "Nord",
            },
            region: {
              code: "32",
              nom: "Hauts-de-France",
            },
            academie: {
              code: "09",
              nom: "Lille",
            },
          },
          uai: "0597114M",
          uai_fiable: false,
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.863Z",
        },
        {
          code: "3.08328_50.6118",
          adresse: {
            label: "15 Rue de l'Université 59790 Ronchin",
            code_postal: "59790",
            code_insee: "59507",
            localite: "Ronchin",
            geojson: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [3.083462, 50.611552],
              },
              properties: {
                score: 0.9999996303144683,
                source: "geo-adresse-api",
              },
            },
            departement: {
              code: "59",
              nom: "Nord",
            },
            region: {
              code: "32",
              nom: "Hauts-de-France",
            },
            academie: {
              code: "09",
              nom: "Lille",
            },
          },
          siret: "13002975400020",
          uai_fiable: false,
          sources: ["catalogue"],
          date_collecte: "2024-12-04T04:52:52.469Z",
        },
      ],
      nature: "formateur",
      referentiels: ["catalogue-etablissements"],
      relations: [
        {
          type: "entreprise",
          siret: "13002975400012",
          label: "UNIVERSITE DE LILLE 59800 LILLE",
          referentiel: true,
          sources: ["sirene"],
          date_collecte: "2024-11-26T05:41:10.917Z",
        },
        {
          type: "entreprise",
          siret: "13002975400079",
          label: "UNIVERSITE DE LILLE 59000 LILLE",
          referentiel: true,
          sources: ["sirene"],
          date_collecte: "2024-11-26T05:41:11.035Z",
        },
        {
          type: "entreprise",
          siret: "13002975400194",
          label: "UNIVERSITE DE LILLE 59650 VILLENEUVE-D'ASCQ",
          referentiel: true,
          sources: ["sirene"],
          date_collecte: "2024-11-26T05:41:11.090Z",
        },
        {
          type: "formateur->responsable",
          siret: "42813525500050",
          label: "FORMASUP HAUTS DE FRANCE",
          referentiel: true,
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:26.863Z",
        },
      ],
      reseaux: [],
      uai_potentiels: [
        {
          uai: "0597114M",
          sources: ["tableau-de-bord"],
          date_collecte: "2024-12-16T04:01:53.298Z",
        },
      ],
      numero_declaration_activite: "32591104359",
      qualiopi: true,
      adresse: {
        academie: {
          code: "09",
          nom: "Lille",
        },
        code_insee: "59507",
        code_postal: "59790",
        departement: {
          code: "59",
          nom: "Nord",
        },
        geojson: {
          geometry: {
            coordinates: [3.082828, 50.611461],
            type: "Point",
          },
          properties: {
            score: 0.8187916577540106,
            source: "geo-adresse-api",
          },
          type: "Feature",
        },
        label: "9 RUE DE L'UNIVERSITE 59790 RONCHIN",
        localite: "Ronchin",
        region: {
          code: "32",
          nom: "Hauts-de-France",
        },
      },
      enseigne: "FACULTE SCIENCES SPORT ET EDUCATION PHYSIQUE",
      etat_administratif: "actif",
      forme_juridique: {
        code: "7383",
        label: "Établissement public national à caractère scientifique culturel et professionnel",
      },
      raison_sociale: "UNIVERSITE DE LILLE",
      siege_social: false,
      uai: "0597114M",
    },
    {
      siret: "26220009000278",
      _meta: {
        anomalies: [],
        date_dernier_import: "2024-11-26T05:02:45.142Z",
        date_import: "2024-11-26T05:02:45.142Z",
        date_collecte: "2024-12-16T04:30:02.636Z",
        nouveau: true,
      },
      certifications: [
        {
          type: "rncp",
          code: "RNCP35830",
          label: "Aide-Soignant",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:20.477Z",
        },
      ],
      contacts: [],
      diplomes: [
        {
          type: "cfd",
          code: "46033104",
          niveau: "460",
          label: "DIV-4",
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:20.477Z",
        },
      ],
      lieux_de_formation: [
        {
          code: "-3.235259_48.782576",
          adresse: {
            label: "-3.235259_48.782576",
            code_postal: "22220",
            code_insee: "22362",
            localite: "Tréguier",
            geojson: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-3.235259, 48.782576],
              },
              properties: {
                score: 1,
                source: "geo-adresse-api",
              },
            },
            departement: {
              code: "22",
              nom: "Côtes-d'Armor",
            },
            region: {
              code: "53",
              nom: "Bretagne",
            },
            academie: {
              code: "14",
              nom: "Rennes",
            },
          },
          siret: "26220009000278",
          uai_fiable: false,
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:20.477Z",
        },
      ],
      nature: "formateur",
      referentiels: ["catalogue-etablissements"],
      relations: [
        {
          type: "entreprise",
          siret: "26220009000013",
          label: "CENTRE HOSPITALIER DE SAINT-BRIEUC, PAIMPOL ET TREGUIER 22000 SAINT-BRIEUC",
          referentiel: false,
          sources: ["sirene"],
          date_collecte: "2024-11-26T05:27:34.373Z",
        },
        {
          type: "entreprise",
          siret: "26220009000229",
          label: "CENTRE HOSPITALIER DE SAINT-BRIEUC, PAIMPOL ET TREGUIER 22000 SAINT-BRIEUC",
          referentiel: true,
          sources: ["sirene"],
          date_collecte: "2024-11-26T05:27:34.401Z",
        },
        {
          type: "entreprise",
          siret: "26220009000328",
          label: "CENTRE HOSPITALIER DE SAINT-BRIEUC, PAIMPOL ET TREGUIER 22470 PLOUEZEC",
          referentiel: true,
          sources: ["sirene"],
          date_collecte: "2024-11-26T05:27:34.486Z",
        },
        {
          type: "formateur->responsable",
          siret: "49188473000046",
          label: "ARFASS BRETAGNE",
          referentiel: true,
          sources: ["catalogue"],
          date_collecte: "2024-12-16T04:53:20.477Z",
        },
      ],
      reseaux: [],
      uai_potentiels: [],
      adresse: {
        academie: {
          code: "14",
          nom: "Rennes",
        },
        code_insee: "22362",
        code_postal: "22220",
        departement: {
          code: "22",
          nom: "Côtes-d'Armor",
        },
        geojson: {
          geometry: {
            coordinates: [-3.2232, 48.783214],
            type: "Point",
          },
          properties: {
            score: 0.7197751906158357,
            source: "geo-adresse-api",
          },
          type: "Feature",
        },
        label: "TOUR SAINT MICHEL 22220 TREGUIER",
        localite: "Tréguier",
        region: {
          code: "53",
          nom: "Bretagne",
        },
      },
      enseigne: "ECOLE D'AIDE SOIGNANTS",
      etat_administratif: "actif",
      forme_juridique: {
        code: "7364",
        label: "Établissement d'hospitalisation",
      },
      raison_sociale: "CENTRE HOSPITALIER DE SAINT-BRIEUC, PAIMPOL ET TREGUIER",
      siege_social: false,
    },
  ];

  it("should return the list of organismes", async () => {
    const data = {
      pagination: {
        page: 1,
        resultats_par_page: 60_000,
        nombre_de_page: 1,
        total: 2,
      },
      organismes,
    };

    nock("https://referentiel.apprentissage.onisep.fr/api/v1")
      .get("/organismes.json")
      .query({ items_par_page: 60_000 })
      .reply(200, data);

    const result = await fetchReferentielOrganismes();

    expect(result).toEqual(organismes);
  });

  it("should throw an error if the total is greater than ITEMS_PAR_PAGES", async () => {
    const data = {
      pagination: {
        page: 1,
        resultats_par_page: 60_000,
        nombre_de_page: 2,
        total: 60_001,
      },
      organismes,
    };

    nock("https://referentiel.apprentissage.onisep.fr/api/v1")
      .get("/organismes.json")
      .query({ items_par_page: 60_000 })
      .reply(200, data);

    await expect(fetchReferentielOrganismes).rejects.toThrow("api.referentiel: too many results");
  });

  it("shoud throw an error if the total is different from the number of results", async () => {
    const data = {
      pagination: {
        page: 1,
        resultats_par_page: 60_000,
        nombre_de_page: 1,
        total: 3,
      },
      organismes,
    };

    nock("https://referentiel.apprentissage.onisep.fr/api/v1")
      .get("/organismes.json")
      .query({ items_par_page: 60_000 })
      .reply(200, data);

    await expect(fetchReferentielOrganismes).rejects.toThrow("api.referentiel: mismatch between total and results");
  });
});
