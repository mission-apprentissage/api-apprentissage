import { useMongo } from "@tests/mongo.test.utils";
import { ObjectId } from "mongodb";
import { ICertification } from "shared/models/certification.model";
import {
  generateCertificationFixture,
  generateSourceBcn_N_FormationDiplomeFixture,
  generateSourceFranceCompetenceFixture,
} from "shared/models/fixtures";
import { IImportMetaCertifications } from "shared/models/import.meta.model";
import { parseParisLocalDate } from "shared/zod/date.primitives";
import { describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import { processCertificationCoverage } from "./coverage.process";

const today = new Date("2023-12-25T02:00:00.000Z");
const yesterday = new Date("2023-12-24T02:00:00.000Z");
const activationStart = new Date("2019-12-25T02:00:00.000Z");

const yesterdayImportMeta: IImportMetaCertifications = {
  _id: new ObjectId(),
  type: "certifications",
  import_date: yesterday,
  source: {
    bcn: {
      import_date: yesterday,
    },
    france_competence: {
      import_date: yesterday,
      nom: "yesterday",
      oldest_date_publication: activationStart,
    },
    kit_apprentissage: {
      import_date: yesterday,
    },
  },
};
const todayImportMeta: IImportMetaCertifications = {
  _id: new ObjectId(),
  type: "certifications",
  import_date: today,
  source: {
    bcn: {
      import_date: today,
    },
    france_competence: {
      import_date: today,
      nom: "today",
      oldest_date_publication: activationStart,
    },
    kit_apprentissage: {
      import_date: today,
    },
  },
};

type T = { value: string; start: Date; end: Date };
const t1 = {
  value: "01/01/2023",
  start: parseParisLocalDate("01/01/2023"),
  end: parseParisLocalDate("01/01/2023", "23:59:59"),
};
const t2 = {
  value: "02/01/2023",
  start: parseParisLocalDate("02/01/2023"),
  end: parseParisLocalDate("02/01/2023", "23:59:59"),
};
const t3 = {
  value: "03/01/2023",
  start: parseParisLocalDate("03/01/2023"),
  end: parseParisLocalDate("03/01/2023", "23:59:59"),
};
const t4 = {
  value: "04/01/2023",
  start: parseParisLocalDate("04/01/2023"),
  end: parseParisLocalDate("04/01/2023", "23:59:59"),
};

useMongo();

describe("cfd coverage", () => {
  const generateCertif = (
    cfd: string,
    ouverture: T | null,
    fermeture: T | null,
    [rncp, debut, fin]: [string | null, T | null, T | null],
    importMeta: IImportMetaCertifications
  ) =>
    generateCertificationFixture({
      identifiant: { cfd, rncp },
      periode_validite: {
        debut: debut?.start ?? null,
        fin: fin?.end ?? null,
        cfd: { ouverture: ouverture?.start ?? null, fermeture: fermeture?.end ?? null },
        rncp: rncp === null ? null : { activation: debut?.start ?? null, fin_enregistrement: fin?.end ?? null },
      },
      created_at: importMeta.import_date,
      updated_at: importMeta.import_date,
    });

  const createFixture = async (
    cfd: string,
    ouverture: T | null,
    fermeture: T | null,
    rncps: Array<[string | null, T | null, T | null]>,
    importMeta: IImportMetaCertifications
  ) => {
    const f = {
      certifs: rncps.map((rncp) => generateCertif(cfd, ouverture, fermeture, rncp, importMeta)),
      bcn: generateSourceBcn_N_FormationDiplomeFixture({
        data: {
          FORMATION_DIPLOME: cfd,
          DATE_OUVERTURE: ouverture?.value ?? null,
          DATE_FERMETURE: fermeture?.value ?? null,
        },
      }),
      fc: rncps
        .filter(([rncp]) => rncp !== null)
        .map(([rncp, debut, fin]) =>
          generateSourceFranceCompetenceFixture({
            numero_fiche: rncp!,
            date_premiere_activation: debut?.start ?? null,
            data: { standard: { Date_Fin_Enregistrement: fin?.value ?? null } },
          })
        ),
    };

    await getDbCollection("certifications").insertMany(f.certifs);
    await getDbCollection("source.bcn").insertMany([f.bcn]);
    if (f.fc.length > 0) {
      await getDbCollection("source.france_competence").insertMany(f.fc);
    }

    return f;
  };

  const expectCertifs = async (expected: ICertification[]) => {
    const data = await getDbCollection("certifications")
      .find(
        {},
        {
          projection: {
            _id: 0,
            "identifiant.cfd": 1,
            "identifiant.rncp": 1,
            "periode_validite.debut": 1,
            "periode_validite.fin": 1,
            updated_at: 1,
          },
          sort: { "identifiant.cfd": 1, "periode_validite.debut": 1 },
        }
      )
      .toArray();
    expect(data).toEqual(
      expected.map((c) => ({
        identifiant: { cfd: c.identifiant.cfd, rncp: c.identifiant.rncp },
        periode_validite: { debut: c.periode_validite.debut, fin: c.periode_validite.fin },
        updated_at: c.updated_at,
      }))
    );
  };

  it("should do nothing when coverage is full", async () => {
    const f1 = await createFixture(
      "10000000",
      t1,
      t2,
      [
        ["RNCP10000", t1, t2],
        ["RNCP10001", t2, t2],
      ],
      todayImportMeta
    );
    const f2 = await createFixture(
      "20000000",
      null,
      t4,
      [
        ["RNCP20000", null, t2],
        ["RNCP20001", t2, t4],
      ],
      todayImportMeta
    );
    const f3 = await createFixture(
      "30000000",
      t1,
      null,
      [
        ["RNCP30000", t1, t2],
        ["RNCP30001", t2, null],
      ],
      todayImportMeta
    );

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([...f1.certifs, ...f2.certifs, ...f3.certifs]);
  });

  it("should consider only current import", async () => {
    const f1 = await createFixture("10000000", t1, t2, [[null, t1, t1]], yesterdayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([...f1.certifs]);
  });

  it("should ensure every CFD has a certification for his entire validity period for fully defined periode", async () => {
    const f1 = await createFixture("10000000", t1, t2, [["RNCP10000", t1, t1]], todayImportMeta);
    const f2 = await createFixture("20000000", t1, t2, [["RNCP20000", t2, t2]], todayImportMeta);
    const f3 = await createFixture("30000000", t1, t4, [["RNCP30000", t2, t3]], todayImportMeta);
    const f4 = await createFixture("40000000", t1, t2, [[null, t1, t2]], todayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([
      ...f1.certifs,
      generateCertif("10000000", t1, t2, [null, t2, t2], todayImportMeta),
      generateCertif("20000000", t1, t2, [null, t1, t1], todayImportMeta),
      ...f2.certifs,
      generateCertif("30000000", t1, t4, [null, t1, t1], todayImportMeta),
      ...f3.certifs,
      generateCertif("30000000", t1, t4, [null, t4, t4], todayImportMeta),
      ...f4.certifs,
    ]);
  });

  it("should ensure every CFD has a certification for his entire validity period when start is not known", async () => {
    const f1 = await createFixture("10000000", null, t2, [["RNCP10000", null, t1]], todayImportMeta);
    const f2 = await createFixture("20000000", null, t2, [["RNCP20000", t2, t2]], todayImportMeta);
    const f3 = await createFixture("30000000", null, t4, [["RNCP30000", t2, t3]], todayImportMeta);
    const f4 = await createFixture("40000000", null, t2, [[null, null, t2]], todayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([
      ...f1.certifs,
      generateCertif("10000000", null, t2, [null, t2, t2], todayImportMeta),
      generateCertif("20000000", null, t2, [null, null, t1], todayImportMeta),
      ...f2.certifs,
      generateCertif("30000000", null, t4, [null, null, t1], todayImportMeta),
      ...f3.certifs,
      generateCertif("30000000", null, t4, [null, t4, t4], todayImportMeta),
      ...f4.certifs,
    ]);
  });

  it("should ensure every CFD has a certification for his entire validity period when end is not known", async () => {
    const f1 = await createFixture("10000000", t1, null, [["RNCP10000", t1, t1]], todayImportMeta);
    const f2 = await createFixture("20000000", t1, null, [["RNCP20000", t2, null]], todayImportMeta);
    const f3 = await createFixture("30000000", t1, null, [["RNCP30000", t2, t3]], todayImportMeta);
    const f4 = await createFixture("40000000", t1, null, [[null, t1, null]], todayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([
      ...f1.certifs,
      generateCertif("10000000", t1, null, [null, t2, null], todayImportMeta),
      generateCertif("20000000", t1, null, [null, t1, t1], todayImportMeta),
      ...f2.certifs,
      generateCertif("30000000", t1, null, [null, t1, t1], todayImportMeta),
      ...f3.certifs,
      generateCertif("30000000", t1, null, [null, t4, null], todayImportMeta),
      ...f4.certifs,
    ]);
  });
});

describe("rncp coverage", () => {
  const generateCertif = (
    rncp: string,
    activation: T | null,
    fin_enregistrement: T | null,
    [cfd, ouverture, fermeture]: [string | null, T | null, T | null],
    importMeta: IImportMetaCertifications
  ) =>
    generateCertificationFixture({
      identifiant: { cfd, rncp },
      periode_validite: {
        debut: ouverture?.start ?? null,
        fin: fermeture?.end ?? null,
        cfd: cfd === null ? null : { ouverture: ouverture?.start ?? null, fermeture: fermeture?.end ?? null },
        rncp:
          rncp === null
            ? null
            : { activation: activation?.start ?? null, fin_enregistrement: fin_enregistrement?.end ?? null },
      },
      created_at: importMeta.import_date,
      updated_at: importMeta.import_date,
    });

  const createFixture = async (
    rncp: string,
    activation: T | null,
    fin_enregistrement: T | null,
    cfds: Array<[string | null, T | null, T | null]>,
    importMeta: IImportMetaCertifications
  ) => {
    const f = {
      certifs: cfds.map((cfd) => generateCertif(rncp, activation, fin_enregistrement, cfd, importMeta)),
      bcn: cfds
        .filter(([cfd]) => cfd !== null)
        .map(([cfd, ouverture, fermeture]) =>
          generateSourceBcn_N_FormationDiplomeFixture({
            data: {
              FORMATION_DIPLOME: cfd!,
              DATE_OUVERTURE: ouverture?.value ?? null,
              DATE_FERMETURE: fermeture?.value ?? null,
            },
          })
        ),
      fc: generateSourceFranceCompetenceFixture({
        numero_fiche: rncp,
        date_premiere_activation: activation?.start ?? null,
        data: { standard: { Date_Fin_Enregistrement: fin_enregistrement?.value ?? null } },
      }),
    };

    await getDbCollection("certifications").insertMany(f.certifs);
    if (f.bcn.length > 0) {
      await getDbCollection("source.bcn").insertMany(f.bcn);
    }
    await getDbCollection("source.france_competence").insertMany([f.fc]);

    return f;
  };

  const expectCertifs = async (expected: ICertification[]) => {
    const data = await getDbCollection("certifications")
      .find(
        {},
        {
          projection: {
            _id: 0,
            "identifiant.cfd": 1,
            "identifiant.rncp": 1,
            "periode_validite.debut": 1,
            "periode_validite.fin": 1,
            updated_at: 1,
          },
          sort: { "identifiant.rncp": 1, "periode_validite.debut": 1 },
        }
      )
      .toArray();
    expect(data).toEqual(
      expected.map((c) => ({
        identifiant: { cfd: c.identifiant.cfd, rncp: c.identifiant.rncp },
        periode_validite: { debut: c.periode_validite.debut, fin: c.periode_validite.fin },
        updated_at: c.updated_at,
      }))
    );
  };

  it("should do nothing when coverage is full", async () => {
    const f1 = await createFixture(
      "RNCP10000",
      t1,
      t2,
      [
        ["10000000", t1, t2],
        ["10000001", t2, t2],
      ],
      todayImportMeta
    );
    const f2 = await createFixture(
      "RNCP20000",
      null,
      t4,
      [
        ["20000000", null, t2],
        ["20000001", t2, t4],
      ],
      todayImportMeta
    );
    const f3 = await createFixture(
      "RNCP30000",
      t1,
      null,
      [
        ["30000000", t1, t2],
        ["30000001", t2, null],
      ],
      todayImportMeta
    );

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([...f1.certifs, ...f2.certifs, ...f3.certifs]);
  });

  it("should consider only current import", async () => {
    const f1 = await createFixture("RNCP10000", t1, t2, [[null, t1, t1]], yesterdayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([...f1.certifs]);
  });

  it("should ensure every RNCP has a certification for his entire validity period for fully defined periode", async () => {
    const f1 = await createFixture("RNCP10000", t1, t2, [["10000000", t1, t1]], todayImportMeta);
    const f2 = await createFixture("RNCP20000", t1, t2, [["20000000", t2, t2]], todayImportMeta);
    const f3 = await createFixture("RNCP30000", t1, t4, [["30000000", t2, t3]], todayImportMeta);
    const f4 = await createFixture("RNCP40000", t1, t2, [[null, t1, t2]], todayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([
      ...f1.certifs,
      generateCertif("RNCP10000", t1, t2, [null, t2, t2], todayImportMeta),
      generateCertif("RNCP20000", t1, t2, [null, t1, t1], todayImportMeta),
      ...f2.certifs,
      generateCertif("RNCP30000", t1, t4, [null, t1, t1], todayImportMeta),
      ...f3.certifs,
      generateCertif("RNCP30000", t1, t4, [null, t4, t4], todayImportMeta),
      ...f4.certifs,
    ]);
  });

  it("should ensure every RNCP has a certification for his entire validity period when start is not known", async () => {
    const f1 = await createFixture("RNCP10000", null, t2, [["10000000", null, t1]], todayImportMeta);
    const f2 = await createFixture("RNCP20000", null, t2, [["20000000", t2, t2]], todayImportMeta);
    const f3 = await createFixture("RNCP30000", null, t4, [["30000000", t2, t3]], todayImportMeta);
    const f4 = await createFixture("RNCP40000", null, t2, [[null, null, t2]], todayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([
      ...f1.certifs,
      generateCertif("RNCP10000", null, t2, [null, t2, t2], todayImportMeta),
      generateCertif("RNCP20000", null, t2, [null, null, t1], todayImportMeta),
      ...f2.certifs,
      generateCertif("RNCP30000", null, t4, [null, null, t1], todayImportMeta),
      ...f3.certifs,
      generateCertif("RNCP30000", null, t4, [null, t4, t4], todayImportMeta),
      ...f4.certifs,
    ]);
  });

  it("should ensure every RNCP has a certification for his entire validity period when end is not known", async () => {
    const f1 = await createFixture("RNCP10000", t1, null, [["10000000", t1, t1]], todayImportMeta);
    const f2 = await createFixture("RNCP20000", t1, null, [["20000000", t2, null]], todayImportMeta);
    const f3 = await createFixture("RNCP30000", t1, null, [["30000000", t2, t3]], todayImportMeta);
    const f4 = await createFixture("RNCP40000", t1, null, [[null, t1, null]], todayImportMeta);

    await processCertificationCoverage(todayImportMeta);

    await expectCertifs([
      ...f1.certifs,
      generateCertif("RNCP10000", t1, null, [null, t2, null], todayImportMeta),
      generateCertif("RNCP20000", t1, null, [null, t1, t1], todayImportMeta),
      ...f2.certifs,
      generateCertif("RNCP30000", t1, null, [null, t1, t1], todayImportMeta),
      ...f3.certifs,
      generateCertif("RNCP30000", t1, null, [null, t4, null], todayImportMeta),
      ...f4.certifs,
    ]);
  });
});
