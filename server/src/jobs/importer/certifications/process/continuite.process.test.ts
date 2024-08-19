import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import {
  generateCertificationFixture,
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures/index";
import { parseParisLocalDate } from "shared/zod/date.primitives";
import { beforeEach, describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { processContinuite } from "./continuite.process.js";

useMongo();

const t1Str = "01/01/2022";
const t1 = parseParisLocalDate(t1Str, "00:00:00");
const t1End = parseParisLocalDate(t1Str, "23:59:59");
const t2Str = "02/01/2022";
const t2 = parseParisLocalDate(t2Str, "00:00:00");
const t2End = parseParisLocalDate(t2Str, "23:59:59");
const t3Str = "03/01/2022";
const t3 = parseParisLocalDate(t3Str, "00:00:00");
const t3End = parseParisLocalDate(t3Str, "23:59:59");
const t4Str = "04/01/2022";
const t4 = parseParisLocalDate(t4Str, "00:00:00");
const t4End = parseParisLocalDate(t4Str, "23:59:59");

describe("CFD continuite", () => {
  const importMeta = {
    _id: new ObjectId(),
    type: "certifications",
    status: "pending",
    import_date: new Date("2023-12-25T02:00:00.000Z"),
    source: {
      bcn: {
        import_date: new Date("2023-12-24T02:00:00.000Z"),
      },
      france_competence: {
        import_date: new Date("2023-12-24T02:00:00.000Z"),
        nom: "nom",
        oldest_date_publication: new Date("2019-12-25T02:00:00.000Z"),
      },
      kit_apprentissage: {
        import_date: new Date("2023-12-24T02:00:00.000Z"),
      },
    },
  } as const;

  const generateCert = (code: string, ouverture: Date, fermeture: Date) =>
    generateCertificationFixture({
      identifiant: { cfd: code, rncp: null },
      periode_validite: { cfd: { ouverture, fermeture }, rncp: null, debut: ouverture, fin: fermeture },
    });

  const c1 = generateCert("00000001", t1, t1End);
  const c2 = generateCert("00000002", t2, t2End);
  const c3 = generateCert("00000003", t3, t3End);
  const c4 = generateCert("00000004", t4, t4End);

  beforeEach(async () => {
    await getDbCollection("certifications").insertMany([c1, c2, c3, c4]);
  });

  const generateBcnData = (cfd: string, anciens: string[], nouveaux: string[], date: string) =>
    generateSourceBcn_N_FormationDiplomeFixture({
      data: {
        FORMATION_DIPLOME: cfd,
        ANCIEN_DIPLOMES: anciens,
        NOUVEAU_DIPLOMES: nouveaux,
        DATE_OUVERTURE: date,
        DATE_FERMETURE: date,
      },
    });

  const expectedSingleChain = [
    {
      identifiant: c1.identifiant,
      periode_validite: c1.periode_validite,
      continuite: {
        cfd: [
          { code: "00000001", ouverture: t1, fermeture: t1End, courant: true },
          { code: "00000002", ouverture: t2, fermeture: t2End, courant: false },
          { code: "00000003", ouverture: t3, fermeture: t3End, courant: false },
          { code: "00000004", ouverture: t4, fermeture: t4End, courant: false },
        ],
      },
    },
    {
      identifiant: c2.identifiant,
      periode_validite: c2.periode_validite,
      continuite: {
        cfd: [
          { code: "00000001", ouverture: t1, fermeture: t1End, courant: false },
          { code: "00000002", ouverture: t2, fermeture: t2End, courant: true },
          { code: "00000003", ouverture: t3, fermeture: t3End, courant: false },
          { code: "00000004", ouverture: t4, fermeture: t4End, courant: false },
        ],
      },
    },
    {
      identifiant: c3.identifiant,
      periode_validite: c3.periode_validite,
      continuite: {
        cfd: [
          { code: "00000001", ouverture: t1, fermeture: t1End, courant: false },
          { code: "00000002", ouverture: t2, fermeture: t2End, courant: false },
          { code: "00000003", ouverture: t3, fermeture: t3End, courant: true },
          { code: "00000004", ouverture: t4, fermeture: t4End, courant: false },
        ],
      },
    },
    {
      identifiant: c4.identifiant,
      periode_validite: c4.periode_validite,
      continuite: {
        cfd: [
          { code: "00000001", ouverture: t1, fermeture: t1End, courant: false },
          { code: "00000002", ouverture: t2, fermeture: t2End, courant: false },
          { code: "00000003", ouverture: t3, fermeture: t3End, courant: false },
          { code: "00000004", ouverture: t4, fermeture: t4End, courant: true },
        ],
      },
    },
  ];

  const expected2Chains = [
    {
      identifiant: c1.identifiant,
      periode_validite: c1.periode_validite,
      continuite: {
        cfd: [
          { code: "00000001", ouverture: t1, fermeture: t1End, courant: true },
          { code: "00000002", ouverture: t2, fermeture: t2End, courant: false },
        ],
      },
    },
    {
      identifiant: c2.identifiant,
      periode_validite: c2.periode_validite,
      continuite: {
        cfd: [
          { code: "00000001", ouverture: t1, fermeture: t1End, courant: false },
          { code: "00000002", ouverture: t2, fermeture: t2End, courant: true },
        ],
      },
    },
    {
      identifiant: c3.identifiant,
      periode_validite: c3.periode_validite,
      continuite: {
        cfd: [
          { code: "00000003", ouverture: t3, fermeture: t3End, courant: true },
          { code: "00000004", ouverture: t4, fermeture: t4End, courant: false },
        ],
      },
    },
    {
      identifiant: c4.identifiant,
      periode_validite: c4.periode_validite,
      continuite: {
        cfd: [
          { code: "00000003", ouverture: t3, fermeture: t3End, courant: false },
          { code: "00000004", ouverture: t4, fermeture: t4End, courant: true },
        ],
      },
    },
  ];

  it("should support biredirectionnal chain", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", [], ["00000002"], t1Str),
      generateBcnData("00000002", ["00000001"], ["00000003"], t2Str),
      generateBcnData("00000003", ["00000002"], ["00000004"], t3Str),
      generateBcnData("00000004", ["00000003"], [], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support chronological mono-directionnal chain", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", [], ["00000002"], t1Str),
      generateBcnData("00000002", [], ["00000003"], t2Str),
      generateBcnData("00000003", [], ["00000004"], t3Str),
      generateBcnData("00000004", [], [], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support anti-chronological mono-directionnal chain", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", [], [], t1Str),
      generateBcnData("00000002", ["00000001"], [], t2Str),
      generateBcnData("00000003", ["00000002"], [], t3Str),
      generateBcnData("00000004", ["00000003"], [], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support bifurcation", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", [], [], t1Str),
      generateBcnData("00000002", ["00000001"], ["00000003", "00000004"], t2Str),
      generateBcnData("00000003", ["00000002"], [], t3Str),
      generateBcnData("00000004", ["00000002"], [], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support merge", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", [], ["00000003"], t1Str),
      generateBcnData("00000002", [], ["00000003"], t2Str),
      generateBcnData("00000003", ["00000001", "00000002"], ["00000004"], t3Str),
      generateBcnData("00000004", ["00000003"], [], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support separate chain", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", [], ["00000002"], t1Str),
      generateBcnData("00000002", ["00000001"], [], t2Str),
      generateBcnData("00000003", [], ["00000004"], t3Str),
      generateBcnData("00000004", ["00000003"], [], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expected2Chains);
  });

  it("should not found cfd codes", async () => {
    await getDbCollection("source.bcn").insertMany([
      generateBcnData("00000001", ["99999999"], ["00000002"], t1Str),
      generateBcnData("00000002", ["00000001"], ["00000003"], t2Str),
      generateBcnData("00000003", ["00000002"], ["00000004"], t3Str),
      generateBcnData("00000004", ["00000003"], ["99999999"], t4Str),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.cfd": 1, periode_validite: 1 },
            sort: { "identifiant.cfd": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });
});

describe("RNCP continuite", () => {
  const importMeta = {
    _id: new ObjectId(),
    type: "certifications",
    import_date: new Date("2023-12-25T02:00:00.000Z"),
    status: "pending",
    source: {
      bcn: {
        import_date: new Date("2023-12-24T02:00:00.000Z"),
      },
      france_competence: {
        import_date: new Date("2023-12-24T02:00:00.000Z"),
        nom: "nom",
        oldest_date_publication: new Date("2019-12-25T02:00:00.000Z"),
      },
      kit_apprentissage: {
        import_date: new Date("2023-12-24T02:00:00.000Z"),
      },
    },
  } as const;

  const generateCert = (code: string, activation: Date, fin_enregistrement: Date, actif: boolean) =>
    generateCertificationFixture({
      identifiant: { rncp: code, cfd: null },
      periode_validite: {
        rncp: {
          activation,
          fin_enregistrement,
          actif,
        },
        cfd: null,
        debut: activation,
        fin: fin_enregistrement,
      },
    });

  const c1 = generateCert("RNCP00001", t1, t1End, false);
  const c2 = generateCert("RNCP00002", t2, t2End, false);
  const c3 = generateCert("RNCP00003", t3, t3End, true);
  const c4 = generateCert("RNCP00004", t4, t4End, false);

  beforeEach(async () => {
    await getDbCollection("certifications").insertMany([c1, c2, c3, c4]);
  });

  const generateFcData = (
    rncp: string,
    anciens: string[],
    nouveaux: string[],
    activation: Date,
    date: string,
    actif: boolean
  ) =>
    generateSourceFranceCompetenceFixture({
      numero_fiche: rncp,
      date_premiere_activation: activation,
      data: {
        standard: {
          Actif: actif ? "ACTIVE" : "INACTIVE",
          Date_Fin_Enregistrement: date,
        },
        ancienne_nouvelle_certification: [
          ...anciens.map((ancien) => ({
            Numero_Fiche: rncp,
            Ancienne_Certification: ancien,
            Nouvelle_Certification: null,
          })),
          ...nouveaux.map((nouveau) => ({
            Numero_Fiche: rncp,
            Ancienne_Certification: null,
            Nouvelle_Certification: nouveau,
          })),
        ],
      },
    });

  const expectedSingleChain = [
    {
      identifiant: c1.identifiant,
      periode_validite: c1.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00001", activation: t1, fin_enregistrement: t1End, courant: true, actif: false },
          { code: "RNCP00002", activation: t2, fin_enregistrement: t2End, courant: false, actif: false },
          { code: "RNCP00003", activation: t3, fin_enregistrement: t3End, courant: false, actif: true },
          { code: "RNCP00004", activation: t4, fin_enregistrement: t4End, courant: false, actif: false },
        ],
      },
    },
    {
      identifiant: c2.identifiant,
      periode_validite: c2.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00001", activation: t1, fin_enregistrement: t1End, courant: false, actif: false },
          { code: "RNCP00002", activation: t2, fin_enregistrement: t2End, courant: true, actif: false },
          { code: "RNCP00003", activation: t3, fin_enregistrement: t3End, courant: false, actif: true },
          { code: "RNCP00004", activation: t4, fin_enregistrement: t4End, courant: false, actif: false },
        ],
      },
    },
    {
      identifiant: c3.identifiant,
      periode_validite: c3.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00001", activation: t1, fin_enregistrement: t1End, courant: false, actif: false },
          { code: "RNCP00002", activation: t2, fin_enregistrement: t2End, courant: false, actif: false },
          { code: "RNCP00003", activation: t3, fin_enregistrement: t3End, courant: true, actif: true },
          { code: "RNCP00004", activation: t4, fin_enregistrement: t4End, courant: false, actif: false },
        ],
      },
    },
    {
      identifiant: c4.identifiant,
      periode_validite: c4.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00001", activation: t1, fin_enregistrement: t1End, courant: false, actif: false },
          { code: "RNCP00002", activation: t2, fin_enregistrement: t2End, courant: false, actif: false },
          { code: "RNCP00003", activation: t3, fin_enregistrement: t3End, courant: false, actif: true },
          { code: "RNCP00004", activation: t4, fin_enregistrement: t4End, courant: true, actif: false },
        ],
      },
    },
  ];

  const expected2Chains = [
    {
      identifiant: c1.identifiant,
      periode_validite: c1.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00001", activation: t1, fin_enregistrement: t1End, courant: true, actif: false },
          { code: "RNCP00002", activation: t2, fin_enregistrement: t2End, courant: false, actif: false },
        ],
      },
    },
    {
      identifiant: c2.identifiant,
      periode_validite: c2.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00001", activation: t1, fin_enregistrement: t1End, courant: false, actif: false },
          { code: "RNCP00002", activation: t2, fin_enregistrement: t2End, courant: true, actif: false },
        ],
      },
    },
    {
      identifiant: c3.identifiant,
      periode_validite: c3.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00003", activation: t3, fin_enregistrement: t3End, courant: true, actif: true },
          { code: "RNCP00004", activation: t4, fin_enregistrement: t4End, courant: false, actif: false },
        ],
      },
    },
    {
      identifiant: c4.identifiant,
      periode_validite: c4.periode_validite,
      continuite: {
        rncp: [
          { code: "RNCP00003", activation: t3, fin_enregistrement: t3End, courant: false, actif: true },
          { code: "RNCP00004", activation: t4, fin_enregistrement: t4End, courant: true, actif: false },
        ],
      },
    },
  ];

  it("should support biredirectionnal chain", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], ["RNCP00002"], t1, t1Str, false),
      generateFcData("RNCP00002", ["RNCP00001"], ["RNCP00003"], t2, t2Str, false),
      generateFcData("RNCP00003", ["RNCP00002"], ["RNCP00004"], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00003"], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support chronological mono-directionnal chain", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], ["RNCP00002"], t1, t1Str, false),
      generateFcData("RNCP00002", [], ["RNCP00003"], t2, t2Str, false),
      generateFcData("RNCP00003", [], ["RNCP00004"], t3, t3Str, true),
      generateFcData("RNCP00004", [], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support anti-chronological mono-directionnal chain", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], [], t1, t1Str, false),
      generateFcData("RNCP00002", ["RNCP00001"], [], t2, t2Str, false),
      generateFcData("RNCP00003", ["RNCP00002"], [], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00003"], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support bifurcation", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], [], t1, t1Str, false),
      generateFcData("RNCP00002", ["RNCP00001"], ["RNCP00003", "RNCP00004"], t2, t2Str, false),
      generateFcData("RNCP00003", ["RNCP00002"], [], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00002"], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support merge", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], ["RNCP00003"], t1, t1Str, false),
      generateFcData("RNCP00002", [], ["RNCP00003"], t2, t2Str, false),
      generateFcData("RNCP00003", ["RNCP00001", "RNCP00002"], ["RNCP00004"], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00003"], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support separate chain", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], ["RNCP00002"], t1, t1Str, false),
      generateFcData("RNCP00002", ["RNCP00001"], [], t2, t2Str, false),
      generateFcData("RNCP00003", [], ["RNCP00004"], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00003"], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expected2Chains);
  });

  it("should support not found rncp code", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], ["RNCP00002", "RNCP99999"], t1, t1Str, false),
      generateFcData("RNCP00002", ["RNCP00001", "RNCP99999"], ["RNCP00003"], t2, t2Str, false),
      generateFcData("RNCP00003", ["RNCP00002"], ["RNCP00004", "RNCP99999"], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00003", "RNCP99999"], [], t4, t4Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });

  it("should support ignore continuity with RS", async () => {
    await getDbCollection("source.france_competence").insertMany([
      generateFcData("RNCP00001", [], ["RNCP00002", "RS0001"], t1, t1Str, false),
      generateFcData("RNCP00002", ["RNCP00001", "RNCP99999"], ["RNCP00003"], t2, t2Str, false),
      generateFcData("RNCP00003", ["RNCP00002"], ["RNCP00004", "RNCP99999"], t3, t3Str, true),
      generateFcData("RNCP00004", ["RNCP00003", "RS0001"], [], t4, t4Str, false),
      generateFcData("RS0001", ["RNCP00004"], ["RNCP00001"], t1, t1Str, false),
    ]);

    await processContinuite(importMeta);
    expect(
      await getDbCollection("certifications")
        .find(
          {},
          {
            projection: { _id: 0, identifiant: 1, "continuite.rncp": 1, periode_validite: 1 },
            sort: { "identifiant.rncp": 1 },
          }
        )
        .toArray()
    ).toEqual(expectedSingleChain);
  });
});
