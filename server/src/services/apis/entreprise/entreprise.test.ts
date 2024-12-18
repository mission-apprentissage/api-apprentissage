import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import nock from "nock";
import type { IApiEntEtablissement } from "shared/models/cache/cache.entreprise.model";
import { zApiEntEtablissement, zApiEntUniteLegale } from "shared/models/cache/cache.entreprise.model";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { getEtablissementDiffusible, getUniteLegaleDiffusible } from "./entreprise.js";

useMongo();

const now = new Date("2024-12-04T00:00:00Z");
const inOneWeek = new Date("2024-12-11T00:00:00Z");

beforeEach(() => {
  nock.disableNetConnect();

  vi.useFakeTimers({ now });

  return () => {
    vi.resetAllMocks();
    vi.useRealTimers();

    nock.cleanAll();
    nock.enableNetConnect();
  };
});

describe("getEtablissementDiffusible", () => {
  const siret = "13002526500013";
  const siren = "130025265";
  const etablissement: IApiEntEtablissement = {
    siret: "13002526500013",
    etat_administratif: "A",
    enseigne: null,
    date_creation: 1495576800,
    date_fermeture: null,
    unite_legale: {
      siren: "130025265",
      type: "personne_morale",
      personne_morale_attributs: {
        raison_sociale: "DIRECTION INTERMINISTERIELLE DU NUMERIQUE",
        sigle: "DINUM",
      },
      personne_physique_attributs: {
        prenom_usuel: null,
        nom_usage: null,
      },
      date_creation: 1495576800,
      etat_administratif: "A",
    },
    adresse: {
      complement_adresse: null,
      numero_voie: "20",
      indice_repetition_voie: null,
      type_voie: "AVENUE",
      libelle_voie: "DE SEGUR",
      code_postal: "75007",
      libelle_commune: "PARIS",
      libelle_commune_etranger: null,
      code_commune: "75107",
      code_pays_etranger: null,
      libelle_pays_etranger: null,
    },
  };

  it("should return etablissement and persist into cache", async () => {
    nock("https://entreprise.api.gouv.fr/v3")
      .get(`/insee/sirene/etablissements/diffusibles/${siret}`)
      .query({
        token: "key",
        recipient: "13002526500013",
        object: "Consolidation des données",
        context: "MNA",
      })
      .reply(200, { data: etablissement });

    const result = await getEtablissementDiffusible(siret);

    expect(result).toEqual(etablissement);

    const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siret });
    expect(cacheEtablissement).toEqual({
      _id: expect.any(ObjectId),
      identifiant: siret,
      ttl: inOneWeek,
      data: {
        type: "etablissement",
        etablissement: etablissement,
      },
    });

    const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });

    expect(cacheUniteLegale).toEqual(null);

    expect(nock.isDone()).toBe(true);
  });

  it("should use cache if etablissement is already in cache", async () => {
    await getDbCollection("cache.entreprise").insertOne({
      _id: new ObjectId(),
      identifiant: siret,
      ttl: inOneWeek,
      data: {
        type: "etablissement",
        etablissement: zApiEntEtablissement.parse(etablissement),
      },
    });

    const result = await getEtablissementDiffusible(siret);

    expect(result).toEqual(etablissement);

    expect(nock.isDone()).toBe(true);
  });

  describe("if etablissement is not found", () => {
    it("should return null if etablissement does not exists, and cache it forever", async () => {
      const scope = nock("https://entreprise.api.gouv.fr/v3")
        .get(`/insee/sirene/etablissements/diffusibles/${siret}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(404, {
          errors: [
            {
              code: "01003",
              title: "Entité non trouvée",
              detail:
                "L'identifiant indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
              meta: {
                provider: "INSEE",
              },
            },
          ],
        });

      scope
        .get(`/insee/sirene/etablissements/${siret}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(404, {
          errors: [
            {
              code: "01003",
              title: "Entité non trouvée",
              detail:
                "L'identifiant indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
              meta: {
                provider: "INSEE",
              },
            },
          ],
        });

      const result = await getEtablissementDiffusible(siret);

      expect(result).toEqual(null);

      expect(nock.isDone()).toBe(true);

      const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siret });
      expect(cacheEtablissement).toEqual({
        _id: expect.any(ObjectId),
        identifiant: siret,
        ttl: null,
        data: {
          type: "etablissement",
          etablissement: null,
        },
      });

      const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });

      // L'etablissement n'existe pas, mais l'unité légale peut exister
      expect(cacheUniteLegale).toEqual(null);
    });

    it("should return partial data if etablissement is not diffusible, and cache it forever", async () => {
      // Fake but include all fields that are not diffusible
      const etablissementPrivate: z.input<typeof zApiEntEtablissement> = {
        siret: "13002526500013",
        etat_administratif: "A",
        enseigne: "Enseigne",
        date_creation: 1495576800,
        date_fermeture: null,
        unite_legale: {
          siren: "130025265",
          type: "personne_morale",
          personne_morale_attributs: {
            raison_sociale: "DIRECTION INTERMINISTERIELLE DU NUMERIQUE",
            sigle: "DINUM",
          },
          personne_physique_attributs: {
            prenom_usuel: "AURELIE",
            nom_usage: "MOREAU",
          },
          date_creation: 1495576800,
          etat_administratif: "A",
        },
        adresse: {
          complement_adresse: null,
          numero_voie: "20",
          indice_repetition_voie: null,
          type_voie: "AVENUE",
          libelle_voie: "DE SEGUR",
          code_postal: "75007",
          libelle_commune: "PARIS",
          libelle_commune_etranger: null,
          code_commune: "75107",
          code_pays_etranger: null,
          libelle_pays_etranger: null,
        },
      };

      const scope = nock("https://entreprise.api.gouv.fr/v3")
        .get(`/insee/sirene/etablissements/diffusibles/${siret}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(404, {
          errors: [
            {
              code: "01003",
              title: "Entité non trouvée",
              detail:
                "L'identifiant indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
              meta: {
                provider: "INSEE",
              },
            },
          ],
        });

      scope
        .get(`/insee/sirene/etablissements/${siret}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(200, { data: etablissementPrivate });

      const result = await getEtablissementDiffusible(siret);

      const expected = {
        siret: "13002526500013",
        etat_administratif: "A",
        enseigne: "Enseigne",
        date_creation: 1495576800,
        date_fermeture: null,
        unite_legale: {
          siren: "130025265",
          type: "personne_morale",
          personne_morale_attributs: {
            raison_sociale: "DIRECTION INTERMINISTERIELLE DU NUMERIQUE",
            sigle: null,
          },
          personne_physique_attributs: {
            prenom_usuel: null,
            nom_usage: null,
          },
          date_creation: 1495576800,
          etat_administratif: "A",
        },
        adresse: {
          complement_adresse: null,
          numero_voie: null,
          indice_repetition_voie: null,
          type_voie: null,
          libelle_voie: null,
          code_postal: null,
          libelle_commune: "PARIS",
          libelle_commune_etranger: null,
          code_commune: "75107",
          code_pays_etranger: null,
          libelle_pays_etranger: null,
        },
      };
      expect(result).toEqual(expected);

      expect(nock.isDone()).toBe(true);

      const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siret });
      expect(cacheEtablissement).toEqual({
        _id: expect.any(ObjectId),
        identifiant: siret,
        ttl: inOneWeek,
        data: {
          type: "etablissement",
          etablissement: expected,
        },
      });

      const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });

      expect(cacheUniteLegale).toEqual(null);
    });
  });

  it('should use cache if etablissement is not found and "etablissement" is already in cache', async () => {
    await getDbCollection("cache.entreprise").insertOne({
      _id: new ObjectId(),
      identifiant: siret,
      ttl: null,
      data: {
        type: "etablissement",
        etablissement: null,
      },
    });

    const result = await getEtablissementDiffusible(siret);

    expect(result).toEqual(null);

    expect(nock.isDone()).toBe(true);
  });

  it("should return null if etablissement is not accessible for legal reason", async () => {
    nock("https://entreprise.api.gouv.fr/v3")
      .get(`/insee/sirene/etablissements/diffusibles/${siret}`)
      .query({
        token: "key",
        recipient: "13002526500013",
        object: "Consolidation des données",
        context: "MNA",
      })
      .reply(451, {
        errors: [
          {
            code: "01005",
            title: "Indisponible pour des raisons légales",
            detail: "Le siret demandé est une entité pour laquelle aucun organisme ne peut avoir accès.",
            meta: {
              provider: "INSEE",
            },
          },
        ],
      });

    const result = await getEtablissementDiffusible(siret);

    expect(result).toEqual(null);

    expect(nock.isDone()).toBe(true);

    const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siret });
    expect(cacheEtablissement).toEqual({
      _id: expect.any(ObjectId),
      identifiant: siret,
      ttl: null,
      data: {
        type: "etablissement",
        etablissement: null,
      },
    });

    const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });

    // L'etablissement n'existe pas, mais l'unité légale peut exister
    expect(cacheUniteLegale).toEqual(null);
  });

  it("should return null if siret is invalid", async () => {
    nock("https://entreprise.api.gouv.fr/v3")
      .get(`/insee/sirene/etablissements/diffusibles/${siret}`)
      .query({
        token: "key",
        recipient: "13002526500013",
        object: "Consolidation des données",
        context: "MNA",
      })
      .reply(422, {
        errors: [
          {
            code: "00302",
            title: "Entité non traitable",
            detail: "Le numéro de siret n'est pas correctement formatté",
            source: {
              parameter: "siret",
            },
            meta: {},
          },
        ],
      });

    const result = await getEtablissementDiffusible(siret);

    expect(result).toEqual(null);

    expect(nock.isDone()).toBe(true);

    const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siret });
    expect(cacheEtablissement).toEqual({
      _id: expect.any(ObjectId),
      identifiant: siret,
      ttl: null,
      data: {
        type: "etablissement",
        etablissement: null,
      },
    });

    const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });

    // Le siret est invalide, mais le siren peut etre valide
    expect(cacheUniteLegale).toEqual(null);
  });
});

describe("getUniteLegaleDiffusible", () => {
  const siren = "130025265";
  const uniteLegale: z.input<typeof zApiEntUniteLegale> = {
    siren,
    type: "personne_morale",
    personne_morale_attributs: {
      raison_sociale: "DIRECTION INTERMINISTERIELLE DU NUMERIQUE",
      sigle: "DINUM",
    },
    personne_physique_attributs: {
      prenom_usuel: null,
      nom_usage: null,
    },
    date_cessation: null,
    date_creation: 1495576800,
    etat_administratif: "A",
  };

  it("should return unite legale and persist into cache", async () => {
    nock("https://entreprise.api.gouv.fr/v3")
      .get(`/insee/sirene/unites_legales/diffusibles/${siren}`)
      .query({
        token: "key",
        recipient: "13002526500013",
        object: "Consolidation des données",
        context: "MNA",
      })
      .reply(200, { data: uniteLegale });

    const result = await getUniteLegaleDiffusible(siren);

    expect(result).toEqual(uniteLegale);

    const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });

    expect(cacheUniteLegale).toEqual({
      _id: expect.any(ObjectId),
      identifiant: siren,
      ttl: inOneWeek,
      data: {
        type: "unite_legale",
        unite_legale: uniteLegale,
      },
    });

    expect(nock.isDone()).toBe(true);
  });

  it("should use cache if etablissement is already in cache", async () => {
    await getDbCollection("cache.entreprise").insertOne({
      _id: new ObjectId(),
      identifiant: siren,
      ttl: inOneWeek,
      data: {
        type: "unite_legale",
        unite_legale: zApiEntUniteLegale.parse(uniteLegale),
      },
    });

    const result = await getUniteLegaleDiffusible(siren);

    expect(result).toEqual(result);

    expect(nock.isDone()).toBe(true);
  });

  describe("if unite legale is not found", () => {
    it("should return mock if unite legale does not exists, and cache it forever", async () => {
      const scope = nock("https://entreprise.api.gouv.fr/v3")
        .get(`/insee/sirene/unites_legales/diffusibles/${siren}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(404, {
          errors: [
            {
              code: "01003",
              title: "Entité non trouvée",
              detail:
                "L'identifiant indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
              meta: {
                provider: "INSEE",
              },
            },
          ],
        });

      scope
        .get(`/insee/sirene/unites_legales/${siren}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(404, {
          errors: [
            {
              code: "01003",
              title: "Entité non trouvée",
              detail:
                "L'identifiant indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
              meta: {
                provider: "INSEE",
              },
            },
          ],
        });

      const result = await getUniteLegaleDiffusible(siren);

      const expected = {
        siren,
        type: "personne_morale",
        personne_morale_attributs: { raison_sociale: null, sigle: null },
        personne_physique_attributs: { prenom_usuel: null, nom_usage: null },
        etat_administratif: "C",
        date_creation: null,
        date_cessation: new Date("1990-01-01").getTime(),
      };
      expect(result).toEqual(expected);

      expect(nock.isDone()).toBe(true);

      const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });
      expect(cacheUniteLegale).toEqual({
        _id: expect.any(ObjectId),
        identifiant: siren,
        ttl: null,
        data: {
          type: "unite_legale",
          unite_legale: expected,
        },
      });
    });

    it("should return partial data if unite_legale is not diffusible, and cache it forever", async () => {
      // Fake but include all fields that are not diffusible
      const uniteLegalePrivate: z.input<typeof zApiEntUniteLegale> = {
        siren: "130025265",
        type: "personne_morale",
        personne_morale_attributs: {
          raison_sociale: "DIRECTION INTERMINISTERIELLE DU NUMERIQUE",
          sigle: "DINUM",
        },
        personne_physique_attributs: {
          prenom_usuel: "AURELIE",
          nom_usage: "MOREAU",
        },
        date_cessation: null,
        date_creation: 1495576800,
        etat_administratif: "A",
      };

      const scope = nock("https://entreprise.api.gouv.fr/v3")
        .get(`/insee/sirene/unites_legales/diffusibles/${siren}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(404, {
          errors: [
            {
              code: "01003",
              title: "Entité non trouvée",
              detail:
                "L'identifiant indiqué n'existe pas, n'est pas connu ou ne comporte aucune information pour cet appel. Veuillez vérifier que l'identifiant correspond au périmètre couvert par l'API.",
              meta: {
                provider: "INSEE",
              },
            },
          ],
        });

      scope
        .get(`/insee/sirene/unites_legales/${siren}`)
        .query({
          token: "key",
          recipient: "13002526500013",
          object: "Consolidation des données",
          context: "MNA",
        })
        .reply(200, { data: uniteLegalePrivate });

      const result = await getUniteLegaleDiffusible(siren);

      const expected = {
        siren: "130025265",
        type: "personne_morale",
        personne_morale_attributs: {
          raison_sociale: "DIRECTION INTERMINISTERIELLE DU NUMERIQUE",
          sigle: null,
        },
        personne_physique_attributs: {
          prenom_usuel: null,
          nom_usage: null,
        },
        date_cessation: null,
        date_creation: 1495576800,
        etat_administratif: "A",
      };
      expect(result).toEqual(expected);

      expect(nock.isDone()).toBe(true);

      const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });
      expect(cacheEtablissement).toEqual({
        _id: expect.any(ObjectId),
        identifiant: siren,
        ttl: inOneWeek,
        data: {
          type: "unite_legale",
          unite_legale: expected,
        },
      });
    });
  });

  it('should use cache if unite_legale is not found and "unite_legale" is already in cache', async () => {
    await getDbCollection("cache.entreprise").insertOne({
      _id: new ObjectId(),
      identifiant: siren,
      ttl: null,
      data: {
        type: "unite_legale",
        unite_legale: null,
      },
    });

    const result = await getUniteLegaleDiffusible(siren);

    expect(result).toEqual(null);

    expect(nock.isDone()).toBe(true);
  });

  it("should return null if unite_legale is not accessible for legal reason", async () => {
    nock("https://entreprise.api.gouv.fr/v3")
      .get(`/insee/sirene/unites_legales/diffusibles/${siren}`)
      .query({
        token: "key",
        recipient: "13002526500013",
        object: "Consolidation des données",
        context: "MNA",
      })
      .reply(451, {
        errors: [
          {
            code: "01005",
            title: "Indisponible pour des raisons légales",
            detail: "Le siret demandé est une entité pour laquelle aucun organisme ne peut avoir accès.",
            meta: {
              provider: "INSEE",
            },
          },
        ],
      });

    const result = await getUniteLegaleDiffusible(siren);

    expect(result).toEqual(null);

    expect(nock.isDone()).toBe(true);

    const cacheUniteLegale = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });
    expect(cacheUniteLegale).toEqual({
      _id: expect.any(ObjectId),
      identifiant: siren,
      ttl: null,
      data: {
        type: "unite_legale",
        unite_legale: null,
      },
    });
  });

  it("should return null if siren is invalid", async () => {
    nock("https://entreprise.api.gouv.fr/v3")
      .get(`/insee/sirene/unites_legales/diffusibles/${siren}`)
      .query({
        token: "key",
        recipient: "13002526500013",
        object: "Consolidation des données",
        context: "MNA",
      })
      .reply(422, {
        errors: [
          {
            code: "00302",
            title: "Entité non traitable",
            detail: "Le numéro de siret n'est pas correctement formatté",
            source: {
              parameter: "siret",
            },
            meta: {},
          },
        ],
      });

    const result = await getUniteLegaleDiffusible(siren);

    expect(result).toEqual(null);

    expect(nock.isDone()).toBe(true);

    const cacheEtablissement = await getDbCollection("cache.entreprise").findOne({ identifiant: siren });
    expect(cacheEtablissement).toEqual({
      _id: expect.any(ObjectId),
      identifiant: siren,
      ttl: null,
      data: {
        type: "unite_legale",
        unite_legale: null,
      },
    });
  });
});
