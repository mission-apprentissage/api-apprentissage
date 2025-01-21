import { useMongo } from "@tests/mongo.test.utils.js";
import type { IFormation } from "api-alternance-sdk";
import { zCertification, zOrganisme } from "api-alternance-sdk";
import { ObjectId } from "mongodb";
import type { ICommuneInternal } from "shared/models/commune.model";
import { generateCertificationInternalFixture } from "shared/models/fixtures/certification.model.fixture";
import { generateOrganismeInternalFixture } from "shared/models/fixtures/organisme.model.fixture";
import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";
import { beforeEach, describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { buildFormation } from "./_.formation.builder.js";

useMongo();

describe("buildFormation", () => {
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

  beforeEach(async () => {
    await getDbCollection("commune").insertMany(communes);
    await getDbCollection("certifications").insertOne(certification);
    await getDbCollection("organisme").insertMany(organismes);
  });

  const source = {
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
        label: source.lieu_formation_adresse,
        code_postal: source.code_postal,

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

      precision: source.distance,

      siret: source.etablissement_lieu_formation_siret,
      uai: source.etablissement_lieu_formation_uai,
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
        debut: new Date(source.date_debut[0]),
        fin: new Date(source.date_fin[0]),
      },
      {
        capacite: 10,
        debut: new Date(source.date_debut[1]),
        fin: new Date(source.date_fin[1]),
      },
      {
        capacite: 10,
        debut: new Date(source.date_debut[2]),
        fin: new Date(source.date_fin[2]),
      },
    ],
    onisep: {
      url: source.onisep_url,
      intitule: source.onisep_intitule,
      libelle_poursuite: source.onisep_libelle_poursuite,
      lien_site_onisepfr: source.onisep_lien_site_onisepfr,
      discipline: source.onisep_discipline,
      domaine_sousdomaine: source.onisep_domaine_sousdomaine,
    },
    statut: { catalogue: "publié" },
    contact: { email: source.email, telephone: source.num_tel },
    identifiant: { cle_ministere_educatif: source.cle_ministere_educatif },
    contenu_educatif: { contenu: source.contenu, objectif: source.objectif },
  };

  it("should build formation", async () => {
    const result = await buildFormation({
      data: source,
      _id: new ObjectId(),
      date: new Date(),
    });
    expect(result).toEqual(expected);
  });

  it("should not add email if it is not valid", async () => {
    const result = await buildFormation({
      data: {
        ...source,
        email: "not-an-email",
      },
      _id: new ObjectId(),
      date: new Date(),
    });
    expect(result).toEqual({
      ...expected,
      contact: { ...expected.contact, email: null },
    });
  });

  it('should not add "onisep_url" if it is not valid', async () => {
    const result = await buildFormation({
      data: {
        ...source,
        onisep_url: "not-an-url",
      },
      _id: new ObjectId(),
      date: new Date(),
    });
    expect(result).toEqual({
      ...expected,
      onisep: { ...expected.onisep, url: null },
    });
  });

  it('should set statut catalogue to "archivé" if "published" is false', async () => {
    const result = await buildFormation({
      data: {
        ...source,
        published: false,
      },
      _id: new ObjectId(),
      date: new Date(),
    });
    expect(result).toEqual({
      ...expected,
      statut: { catalogue: "archivé" },
    });
  });

  it('should set contenu_educatif to empty string if "contenu" is null', async () => {
    const result = await buildFormation({
      data: {
        ...source,
        contenu: null,
        objectif: null,
      },
      _id: new ObjectId(),
      date: new Date(),
    });

    expect(result).toEqual({
      ...expected,
      contenu_educatif: { objectif: "", contenu: "" },
    });
  });
});
