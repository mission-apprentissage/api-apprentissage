import { useMongo } from "@tests/mongo.test.utils.js";
import type { IFormation } from "api-alternance-sdk";
import { zCertification, zOrganisme } from "api-alternance-sdk";
import { ObjectId } from "mongodb";
import type { ICommuneInternal } from "shared/models/commune.model";
import { generateCertificationInternalFixture } from "shared/models/fixtures/certification.model.fixture";
import { generateOrganismeInternalFixture } from "shared/models/fixtures/organisme.model.fixture";
import type { IImportMeta, IImportMetaFormations } from "shared/models/import.meta.model";
import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { importFormations } from "./formation.importer.js";

const now = new Date("2024-03-07T10:00:00Z");
const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);

const yesterdaySourceImports = {
  organismes: {
    _id: new ObjectId(),
    type: "organismes",
    import_date: yesterday,
    status: "done",
    source: {
      referentiel: { import_date: yesterday },
      communes: { import_date: yesterday },
    },
  },
  catalogue: { _id: new ObjectId(), type: "catalogue", import_date: yesterday, status: "done" },
  certifications: {
    _id: new ObjectId(),
    type: "certifications",
    import_date: yesterday,
    status: "done",
    source: {
      bcn: { import_date: yesterday },
      kit_apprentissage: { import_date: yesterday },
      france_competence: { import_date: yesterday, nom: "FC", oldest_date_publication: yesterday },
    },
  },
  communes: { _id: new ObjectId(), type: "communes", import_date: yesterday, status: "done" },
} as const satisfies Record<string, IImportMeta>;

const todaySourceImports = {
  organismes: {
    _id: new ObjectId(),
    type: "organismes",
    import_date: twoHoursAgo,
    status: "done",
    source: {
      referentiel: { import_date: twoHoursAgo },
      communes: { import_date: twoHoursAgo },
    },
  },
  catalogue: { _id: new ObjectId(), type: "catalogue", import_date: twoHoursAgo, status: "done" },
  certifications: {
    _id: new ObjectId(),
    type: "certifications",
    import_date: twoHoursAgo,
    status: "done",
    source: {
      bcn: { import_date: twoHoursAgo },
      kit_apprentissage: { import_date: twoHoursAgo },
      france_competence: { import_date: twoHoursAgo, nom: "FC", oldest_date_publication: yesterday },
    },
  },
  communes: { _id: new ObjectId(), type: "communes", import_date: twoHoursAgo, status: "done" },
} as const satisfies Record<string, IImportMeta>;

const yesterdayImport = {
  _id: new ObjectId(),
  type: "formations",
  status: "done",
  import_date: yesterday,
  source: {
    organismes: { import_date: yesterdaySourceImports.organismes.import_date },
    catalogue: { import_date: yesterdaySourceImports.catalogue.import_date },
    certifications: { import_date: yesterdaySourceImports.certifications.import_date },
    communes: { import_date: yesterdaySourceImports.communes.import_date },
  },
} as const satisfies IImportMetaFormations;

const todayImport = {
  _id: new ObjectId(),
  type: "formations",
  status: "done",
  import_date: now,
  source: {
    organismes: { import_date: todaySourceImports.organismes.import_date },
    catalogue: { import_date: todaySourceImports.catalogue.import_date },
    certifications: { import_date: todaySourceImports.certifications.import_date },
    communes: { import_date: todaySourceImports.communes.import_date },
  },
} as const satisfies IImportMetaFormations;

const communes: ICommuneInternal[] = [
  {
    _id: new ObjectId(),
    code: {
      insee: "13055",
      postaux: [
        "13001",
        "13002",
        "13003",
        "13004",
        "13005",
        "13006",
        "13007",
        "13008",
        "13009",
        "13010",
        "13011",
        "13012",
        "13013",
        "13014",
        "13015",
        "13016",
      ],
    },
    academie: {
      nom: "Aix-Marseille",
      id: "A02",
      code: "02",
    },
    created_at: new Date("2024-11-28T15:47:27.885Z"),
    departement: {
      nom: "Bouches-du-Rhône",
      codeInsee: "13",
    },
    localisation: {
      centre: {
        coordinates: [5.3806, 43.2803],
        type: "Point",
      },
      bbox: {
        coordinates: [
          [
            [5.228734, 43.169626],
            [5.532543, 43.169626],
            [5.532543, 43.391057],
            [5.228734, 43.391057],
            [5.228734, 43.169626],
          ],
        ],
        type: "Polygon",
      },
    },
    mission_locale: {
      id: 323,
      code: "13201",
      nom: "DE MARSEILLE",
      siret: "41035534100042",
      localisation: {
        geopoint: {
          type: "Point",
          coordinates: [5.3904529, 43.2834795],
        },
        adresse: "23 avenue de Corinthe",
        cp: "13006",
        ville: "MARSEILLE",
      },
      contact: {
        email: "siege@mail.fr",
        telephone: "04 91 19 01 20",
        siteWeb: "https://missionlocalemarseille.fr/",
      },
    },
    nom: "Marseille",
    region: {
      codeInsee: "93",
      nom: "Provence-Alpes-Côte d'Azur",
    },
    updated_at: new Date("2025-01-03T03:14:01.249Z"),
    arrondissements: [
      {
        code: "13201",
        nom: "Marseille 1er Arrondissement",
      },
      {
        code: "13202",
        nom: "Marseille 2e Arrondissement",
      },
      {
        code: "13203",
        nom: "Marseille 3e Arrondissement",
      },
      {
        code: "13204",
        nom: "Marseille 4e Arrondissement",
      },
      {
        code: "13205",
        nom: "Marseille 5e Arrondissement",
      },
      {
        code: "13206",
        nom: "Marseille 6e Arrondissement",
      },
      {
        code: "13207",
        nom: "Marseille 7e Arrondissement",
      },
      {
        code: "13208",
        nom: "Marseille 8e Arrondissement",
      },
      {
        code: "13209",
        nom: "Marseille 9e Arrondissement",
      },
      {
        code: "13210",
        nom: "Marseille 10e Arrondissement",
      },
      {
        code: "13211",
        nom: "Marseille 11e Arrondissement",
      },
      {
        code: "13212",
        nom: "Marseille 12e Arrondissement",
      },
      {
        code: "13213",
        nom: "Marseille 13e Arrondissement",
      },
      {
        code: "13214",
        nom: "Marseille 14e Arrondissement",
      },
      {
        code: "13215",
        nom: "Marseille 15e Arrondissement",
      },
      {
        code: "13216",
        nom: "Marseille 16e Arrondissement",
      },
    ],
    anciennes: [],
  },
];

const rncp = "RNCP35234";
const cfd = "56T34302";

const certification = generateCertificationInternalFixture({
  identifiant: { rncp, cfd, rncp_anterieur_2019: false },
});

const organismes = [
  generateOrganismeInternalFixture({
    identifiant: { siret: "42339754600114", uai: "0212270D" },
  }),
  generateOrganismeInternalFixture({
    identifiant: { siret: "19350030300014", uai: "0352660B" },
  }),
];

const sourceFormation = {
  cfd,
  rncp_code: rncp,
  code_commune_insee: "13055",
  lieu_formation_geo_coordonnees: "5.3919076,43.2701626",
  lieu_formation_geo_coordonnees_computed: "5.3847529,43.2734432",
  lieu_formation_adresse: "9 Sq. Michelet",
  code_postal: "13009",
  distance: 684,
  etablissement_lieu_formation_siret: "13002526500013",
  etablissement_lieu_formation_uai: "0694669A",
  duree: "2",
  entierement_a_distance: false,
  annee: "1",
  bcn_mefs_10: [
    {
      mef10: "3112501421",
      modalite: {
        duree: "2",
        annee: "2",
      },
    },
  ],
  etablissement_formateur_siret: organismes[0].identifiant.siret,
  etablissement_formateur_uai: organismes[0].identifiant.uai,
  etablissement_gestionnaire_siret: organismes[1].identifiant.siret,
  etablissement_gestionnaire_uai: organismes[1].identifiant.uai,
  date_debut: ["2022-09-01T00:00:00.000Z", "2023-09-11T00:00:00.000Z", "2024-09-02T00:00:00.000Z"],
  date_fin: ["2024-07-09T00:00:00.000Z", "2025-07-07T00:00:00.000Z", "2026-07-10T00:00:00.000Z"],
  capacite: "10",
  cle_ministere_educatif: "087965P01213885594860007038855948600070-67180#L01",
  published: true,
  email: "contact@mail.fr",
  num_tel: "0600000000",
  onisep_url: "http://www.onisep.fr/http/redirection/formation/slug/FOR.5839",
  onisep_intitule: "bac pro Métiers du commerce et de la vente option A animation et gestion de l'espace commercial",
  onisep_libelle_poursuite:
    "MC Vendeur spécialisé en alimentation ; MC Assistance, conseil, vente à distance ; BTS Négociation et digitalisation de la relation client ; BTS Management commercial opérationnel ; BTSA Technico-commercial",
  onisep_lien_site_onisepfr: "http://www.onisep.fr/http/redirection/formation/slug/FOR.5839",
  onisep_discipline: "commerce distribution ; vente",
  onisep_domaine_sousdomaine:
    "commerce, marketing, vente/grande distribution et petits commerces ; commerce, marketing, vente/marketing - vente",
  contenu: "Contenu éducatif",
  objectif: "Avoir son diplôme",
  catalogue_published: true,
  tags: ["2022", "2023", "2024"],
} as const satisfies IFormationCatalogue;

const expected: IFormation = {
  lieu: {
    adresse: {
      label: sourceFormation.lieu_formation_adresse,
      code_postal: sourceFormation.code_postal,

      commune: {
        nom: communes[0].nom,
        code_insee: communes[0].code.insee,
      },
      departement: {
        nom: communes[0].departement.nom,
        code_insee: communes[0].departement.codeInsee,
      },
      region: {
        code_insee: communes[0].region.codeInsee,
        nom: communes[0].region.nom,
      },
      academie: {
        id: communes[0].academie.id,
        code: communes[0].academie.code,
        nom: communes[0].academie.nom,
      },
    },

    geolocalisation: {
      type: "Point",
      coordinates: [43.2701626, 5.3919076],
    },

    precision: sourceFormation.distance,

    siret: sourceFormation.etablissement_lieu_formation_siret,
    uai: sourceFormation.etablissement_lieu_formation_uai,
  },
  certification: {
    valeur: zCertification.parse(certification),
    connue: true,
  },
  modalite: {
    entierement_a_distance: false,
    duree_indicative: 2,
    annee_cycle: 1,
    mef_10: "3112501421",
  },
  formateur: {
    organisme: zOrganisme.parse(organismes[0]),
    connu: true,
  },
  responsable: {
    organisme: zOrganisme.parse(organismes[1]),
    connu: true,
  },
  sessions: [
    {
      capacite: 10,
      debut: new Date(sourceFormation.date_debut[0]),
      fin: new Date(sourceFormation.date_fin[0]),
    },
    {
      capacite: 10,
      debut: new Date(sourceFormation.date_debut[1]),
      fin: new Date(sourceFormation.date_fin[1]),
    },
    {
      capacite: 10,
      debut: new Date(sourceFormation.date_debut[2]),
      fin: new Date(sourceFormation.date_fin[2]),
    },
  ],
  onisep: {
    url: sourceFormation.onisep_url,
    intitule: sourceFormation.onisep_intitule,
    libelle_poursuite: sourceFormation.onisep_libelle_poursuite,
    lien_site_onisepfr: sourceFormation.onisep_lien_site_onisepfr,
    discipline: sourceFormation.onisep_discipline,
    domaine_sousdomaine: sourceFormation.onisep_domaine_sousdomaine,
  },
  statut: { catalogue: "publié" },
  contact: { email: sourceFormation.email, telephone: sourceFormation.num_tel },
  identifiant: { cle_ministere_educatif: sourceFormation.cle_ministere_educatif },
  contenu_educatif: { contenu: sourceFormation.contenu, objectif: sourceFormation.objectif },
};

useMongo();

describe("importFormations", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    return () => {
      vi.useRealTimers();
    };
  });

  describe.each(Object.keys(todaySourceImports).map((k) => [k]))("when source %s import is not complete", (source) => {
    beforeEach(async () => {
      for (const [k, v] of Object.entries(todaySourceImports)) {
        if (k !== source) {
          await getDbCollection("import.meta").insertOne(v);
        }
      }
    });

    it("should skip import", async () => {
      expect(await importFormations()).toBe(null);
      expect(await getDbCollection("import.meta").find({ type: "formations" }).toArray()).toEqual([]);
    });
  });

  describe("when source import is complete", () => {
    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany(Object.values(yesterdaySourceImports));

      await getDbCollection("commune").insertMany(communes);
      await getDbCollection("certifications").insertOne(certification);
      await getDbCollection("organisme").insertMany(organismes);

      await getDbCollection("source.catalogue").insertOne({
        data: sourceFormation,
        _id: new ObjectId(),
        date: yesterdaySourceImports.catalogue.import_date,
      });
    });

    it("should import", async () => {
      expect(await importFormations()).toEqual({
        success: 1,
        skipped: 0,
      });
      expect(await getDbCollection("import.meta").find({ type: "formations" }).toArray()).toEqual([
        {
          _id: expect.any(ObjectId),
          import_date: now,
          source: yesterdayImport.source,
          type: "formations",
          status: "done",
        },
      ]);
      expect(
        await getDbCollection("formation")
          .find({}, { projection: { _id: 0 } })
          .toArray()
      ).toEqual([
        {
          ...expected,
          created_at: now,
          updated_at: now,
        },
      ]);
    });

    describe("when import already in sync", () => {
      beforeEach(async () => {
        await getDbCollection("import.meta").insertOne(yesterdayImport);
      });

      it("should skip import", async () => {
        expect(await importFormations()).toBe(null);
        expect(await getDbCollection("import.meta").find({ type: "formations" }).toArray()).toEqual([yesterdayImport]);
        expect(
          await getDbCollection("formation")
            .find({}, { projection: { _id: 0 } })
            .toArray()
        ).toEqual([]);
      });
    });

    describe("when previous import failed", () => {
      beforeEach(async () => {
        await getDbCollection("import.meta").insertOne({ ...yesterdayImport, status: "failed" });
      });

      it("should import", async () => {
        expect(await importFormations()).toEqual({ skipped: 0, success: 1 });
        expect(
          await getDbCollection("import.meta")
            .find({ type: "formations" }, { sort: { import_date: 1 } })
            .toArray()
        ).toEqual([
          { ...yesterdayImport, _id: expect.any(ObjectId), status: "failed" },
          {
            ...yesterdayImport,
            import_date: now,
            _id: expect.any(ObjectId),
          },
        ]);
        expect(
          await getDbCollection("formation")
            .find({}, { projection: { _id: 0 } })
            .toArray()
        ).toEqual([
          {
            ...expected,
            created_at: now,
            updated_at: now,
          },
        ]);
      });
    });

    describe.each(Object.keys(todaySourceImports).map((k) => [k]))(
      "when source %s import is updated",
      (source: string) => {
        beforeEach(async () => {
          await getDbCollection("import.meta").insertOne(yesterdayImport);
          await getDbCollection("import.meta").insertOne(todaySourceImports[source as keyof typeof todaySourceImports]);

          if (source === "catalogue") {
            await getDbCollection("source.catalogue").insertOne({
              data: sourceFormation,
              _id: new ObjectId(),
              date: todaySourceImports.catalogue.import_date,
            });
          }
        });

        it("should import", async () => {
          expect(await importFormations()).toEqual({ skipped: 0, success: 1 });
          expect(await getDbCollection("import.meta").find({ type: "formations" }).toArray()).toEqual([
            yesterdayImport,
            {
              ...todayImport,
              _id: expect.any(ObjectId),
              import_date: now,
              source: {
                ...yesterdayImport.source,
                [source]: { import_date: todaySourceImports[source as keyof typeof todaySourceImports].import_date },
              },
              status: "done",
              type: "formations",
            },
          ]);
          expect(
            await getDbCollection("formation")
              .find({}, { projection: { _id: 0 } })
              .toArray()
          ).toEqual([
            {
              ...expected,
              created_at: now,
              updated_at: now,
            },
          ]);
        });
      }
    );
  });

  describe("when source are not in sync with organismes", () => {
    const existingFormation = {
      updated: [
        {
          ...expected,
          created_at: yesterday,
          updated_at: yesterday,
          certification: {
            valeur: expected.certification.valeur,
            connue: false,
          },
        },
      ],
      removed: [
        {
          ...expected,
          created_at: yesterday,
          updated_at: yesterday,
          identifiant: {
            cle_ministere_educatif: "removed-67180#L01",
          },
        },
      ],
    };

    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany(Object.values(yesterdaySourceImports));
      await getDbCollection("import.meta").insertOne(yesterdayImport);
      await getDbCollection("import.meta").insertMany(Object.values(todaySourceImports));

      await getDbCollection("commune").insertMany(communes);
      await getDbCollection("certifications").insertOne(certification);
      await getDbCollection("organisme").insertMany(organismes);

      await getDbCollection("source.catalogue").insertMany([
        {
          data: sourceFormation,
          _id: new ObjectId(),
          date: todaySourceImports.catalogue.import_date,
        },
      ]);

      await getDbCollection("formation").insertMany(
        existingFormation.updated.map((f) => ({ ...f, _id: new ObjectId() }))
      );
      await getDbCollection("formation").insertMany(
        existingFormation.removed.map((f) => ({ ...f, _id: new ObjectId() }))
      );
    });

    it("should import organismes", async () => {
      expect(await importFormations()).toEqual({ skipped: 0, success: 1 });
      expect(
        await getDbCollection("import.meta")
          .find({ type: "formations" }, { sort: { import_date: 1 } })
          .toArray()
      ).toEqual([
        yesterdayImport,
        {
          ...todayImport,
          _id: expect.any(ObjectId),
        },
      ]);

      const formations = await getDbCollection("formation")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, statut: 1, created_at: 1, updated_at: 1 },
            sort: { "identifiant.cle_ministere_educatif": 1 },
          }
        )
        .toArray();

      expect(formations).toEqual([
        {
          identifiant: expected.identifiant,
          statut: { catalogue: "publié" },
          created_at: yesterday,
          updated_at: now,
        },
        {
          identifiant: existingFormation.removed[0].identifiant,
          statut: { catalogue: "archivé" },
          created_at: yesterday,
          updated_at: yesterday,
        },
      ]);
    });
  });

  describe("when formation is invalid", async () => {
    beforeEach(async () => {
      await getDbCollection("import.meta").insertMany(Object.values(yesterdaySourceImports));
      await getDbCollection("import.meta").insertOne(yesterdayImport);
      await getDbCollection("import.meta").insertMany(Object.values(todaySourceImports));

      await getDbCollection("commune").insertMany(communes);
      await getDbCollection("certifications").insertOne(certification);
      await getDbCollection("organisme").insertMany(organismes);
    });

    it("should error when a published formation is invalid", async () => {
      await getDbCollection("source.catalogue").insertMany([
        {
          data: {
            ...sourceFormation,
            rncp_code: "invalid",
          },
          _id: new ObjectId(),
          date: todaySourceImports.catalogue.import_date,
        },
      ]);
      await expect(importFormations()).rejects.toThrowError("import.formations: unable to importFormations");
      expect(await getDbCollection("import.meta").find({ type: "formations" }).toArray()).toEqual([
        yesterdayImport,
        {
          ...todayImport,
          _id: expect.any(ObjectId),
          status: "failed",
        },
      ]);
      expect(await getDbCollection("formation").find({}).toArray()).toEqual([]);
    });

    it("should skip when an archived formation is invalid", async () => {
      await getDbCollection("source.catalogue").insertMany([
        {
          data: {
            ...sourceFormation,
            published: false,
            rncp_code: "invalid",
          },
          _id: new ObjectId(),
          date: todaySourceImports.catalogue.import_date,
        },
      ]);
      await expect(importFormations()).resolves.toEqual({
        success: 0,
        skipped: 1,
      });
      expect(await getDbCollection("import.meta").find({ type: "formations" }).toArray()).toEqual([
        yesterdayImport,
        {
          ...todayImport,
          _id: expect.any(ObjectId),
          status: "done",
        },
      ]);
      expect(await getDbCollection("formation").find({}).toArray()).toEqual([]);
    });
  });
});
