import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import type { ICertification } from "../../models/index.js";
import { ApiError } from "../apiError.js";
import { ApiClient } from "../client.js";

beforeEach(() => {
  disableNetConnect();

  return () => {
    cleanAll();
    enableNetConnect();
  };
});

describe("index", () => {
  const certif = {
    identifiant: {
      cfd: "13522012",
      rncp: "RNCP38704",
      rncp_anterieur_2019: false,
    },
    intitule: {
      cfd: {
        long: "CHIMIE ET SCIENCES DES MATERIAUX (MASTER)",
        court: "CHIMIE ET SC DES MATERIAUX",
      },
      niveau: {
        cfd: {
          europeen: "7",
          formation_diplome: "135",
          interministeriel: "1",
          libelle: "DIPLOME NATIONAL / DIPLOME D'ETAT",
          sigle: "MASTER PRO",
        },
        rncp: {
          europeen: "7",
        },
      },
      rncp: "Chimie et sciences des matériaux (fiche nationale)",
    },
    base_legale: {
      cfd: {
        creation: null,
        abrogation: null,
      },
    },
    blocs_competences: {
      rncp: [
        {
          code: "RNCP38704BC03",
          intitule: "Mettre en oeuvre une communication spécialisée pour le transfert de connaissances",
        },
        {
          code: "RNCP38704BC02",
          intitule: "Mobiliser et produire des savoirs hautement spécialisés",
        },
        {
          code: "RNCP38704BC01",
          intitule: "Mettre en oeuvre les usages avancés et spécialisés des outils numériques",
        },
        {
          code: "RNCP38704BC04",
          intitule: "Contribuer à la transformation en contexte professionnel",
        },
        {
          code: "RNCP38704BC05",
          intitule:
            "Résoudre des problèmes complexes en mobilisant les concepts fondamentaux de la chimie des matériaux",
        },
        {
          code: "RNCP38704BC07",
          intitule: "Analyser des données expérimentales en chimie des matériaux",
        },
        {
          code: "RNCP38704BC06",
          intitule: "Pratiquer une démarche expérimentale adaptée à un problème de chimie des matériaux",
        },
      ],
    },
    convention_collectives: {
      rncp: [],
    },
    domaines: {
      formacodes: {
        rncp: [
          {
            code: "31676",
            intitule: "31676 : Bureau études",
          },
          {
            code: "31608",
            intitule: "31608 : Génie procédés",
          },
          {
            code: "31648",
            intitule: "31648 : Transfert technologie",
          },
          {
            code: "32062",
            intitule: "32062 : Recherche développement",
          },
        ],
      },
      nsf: {
        cfd: {
          code: "220",
          intitule: "SPEC.PLURITECHNO DES TRANSFORMATIONS",
        },
        rncp: [
          {
            code: "110",
            intitule: "110 : Spécialités pluri-scientifiques",
          },
          {
            code: "111f",
            intitule: "111f : Sciences des matériaux, physique-chimie des procédés industriels",
          },
          {
            code: "116",
            intitule: "116 : Chimie",
          },
        ],
      },
      rome: {
        rncp: [
          {
            code: "H2301",
            intitule: "Conduite d''équipement de production chimique ou pharmaceutique",
          },
          {
            code: "H1206",
            intitule: "Management et ingénierie études, recherche et développement industriel",
          },
          {
            code: "H1402",
            intitule: "Management et ingénierie méthodes et industrialisation",
          },
          {
            code: "H1502",
            intitule: "Management et ingénierie qualité industrielle",
          },
          {
            code: "H2504",
            intitule: "Encadrement d''équipe en industrie de transformation",
          },
        ],
      },
    },
    periode_validite: {
      debut: new Date("2024-02-27T00:00:00.000+01:00"),
      fin: new Date("2029-04-30T23:59:59.000+02:00"),
      cfd: {
        ouverture: new Date("2019-09-01T00:00:00.000+02:00"),
        fermeture: null,
        premiere_session: null,
        derniere_session: null,
      },
      rncp: {
        actif: true,
        activation: new Date("2024-02-27T00:00:00.000+01:00"),
        debut_parcours: new Date("2024-05-01T00:00:00.000+02:00"),
        fin_enregistrement: new Date("2029-04-30T23:59:59.000+02:00"),
      },
    },
    type: {
      nature: {
        cfd: {
          code: "1",
          libelle: "DIPLOME NATIONAL / DIPLOME D'ETAT",
        },
      },
      gestionnaire_diplome: null,
      enregistrement_rncp: "Enregistrement de droit",
      voie_acces: {
        rncp: {
          apprentissage: true,
          experience: true,
          candidature_individuelle: false,
          contrat_professionnalisation: true,
          formation_continue: true,
          formation_statut_eleve: true,
        },
      },
      certificateurs_rncp: [
        {
          siret: "19830766200017",
          nom: "UNIVERSITE DE TOULON",
        },
        {
          siret: "19691774400019",
          nom: "UNIVERSITE CLAUDE BERNARD LYON 1",
        },
        {
          siret: "19370800500478",
          nom: "UNIVERSITE DE TOURS",
        },
        {
          siret: "19911975100014",
          nom: "UNIVERSITE D EVRY VAL D ESSONNE",
        },
        {
          siret: "19421095100423",
          nom: "UNIVERSITE JEAN MONNET SAINT ETIENNE",
        },
        {
          siret: "18009202500154",
          nom: "INSTITUT MINES TELECOM - DIRECTION GENERALE",
        },
        {
          siret: "19690187000010",
          nom: "ECOLE CENTRALE DE LYON",
        },
        {
          siret: "11004401300040",
          nom: "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR ET DE LA RECHERCHE",
        },
      ],
    },
    continuite: {
      cfd: null,
      rncp: [
        {
          activation: new Date("2022-06-12T00:00:00.000+02:00"),
          fin_enregistrement: new Date("2024-04-30T23:59:59.000+02:00"),
          code: "RNCP34112",
          courant: false,
          actif: false,
        },
        {
          activation: new Date("2024-02-27T00:00:00.000+01:00"),
          fin_enregistrement: new Date("2029-04-30T23:59:59.000+02:00"),
          code: "RNCP38704",
          courant: true,
          actif: true,
        },
      ],
    },
  };

  const certifJson = JSON.parse(JSON.stringify(certif));

  it("should call the API with the correct querystring", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({})
      .reply(200, [certifJson]);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.certification.index({});

    expectTypeOf(data).toEqualTypeOf<ICertification[]>();

    expect(scope.isDone()).toBe(true);
    // Should parse dates
    expect(data[0].periode_validite.debut).toBeInstanceOf(Date);
    expect(data).toEqual([certif]);
  });

  it.each([
    ["12345", "12345"],
    ["null", null],
  ])("should support cfd filter %s", async (queryValue, cfd) => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({ "identifiant.cfd": queryValue })
      .reply(200, []);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.certification.index({ identifiant: { cfd } });

    expectTypeOf(data).toEqualTypeOf<ICertification[]>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual([]);
  });

  it.each([
    ["12345", "12345"],
    ["null", null],
  ])("should support rncp filter %s", async (queryValue, rncp) => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({ "identifiant.rncp": queryValue })
      .reply(200, []);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.certification.index({ identifiant: { rncp } });

    expectTypeOf(data).toEqualTypeOf<ICertification[]>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual([]);
  });

  it("should throw an ApiError when server error", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({})
      .reply(401, {
        statusCode: 401,
        name: "Unauthorized",
        message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource",
      });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.certification
      .index({})
      .then(() => {
        expect.unreachable("should throw an error");
      })
      .catch((error: ApiError) => {
        return error;
      });

    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe("Unauthorized");

    expect(scope.isDone()).toBe(true);
  });

  it("should throw if the response does not match the schema", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({})
      .reply(200, { breaking: "schema" });

    const apiClient = new ApiClient({ key: "api-key" });
    const err = await apiClient.certification
      .index({})
      .then(() => {
        expect.unreachable("should throw an error");
      })
      .catch((error: ApiError) => {
        return error;
      });

    // expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe("ApiParseError");
    expect(err.message).toMatchSnapshot();

    expect(scope.isDone()).toBe(true);
  });

  it("should accepts future schema ehancements", async () => {
    const scope = nock("https://api.apprentissage.beta.gouv.fr/api", {
      reqheaders: { authorization: "Bearer api-key" },
    })
      .get("/certification/v1")
      .query({})
      .reply(200, [
        {
          ...certif,
          new_field: "new_field",
        },
      ]);

    const apiClient = new ApiClient({ key: "api-key" });

    const data = await apiClient.certification.index({});

    expectTypeOf(data).toEqualTypeOf<ICertification[]>();

    expect(scope.isDone()).toBe(true);
    expect(data).toEqual([certif]);
  });
});
