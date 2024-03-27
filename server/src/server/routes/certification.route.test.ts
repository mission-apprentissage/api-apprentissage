import { useMongo } from "@tests/mongo.test.utils";
import { DateTime } from "luxon";
import { ICertification } from "shared/models/certification.model";
import { generateCertificationFixture } from "shared/models/fixtures";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createUser, generateApiKey } from "@/actions/users.actions";
import createServer, { Server } from "@/server/server";

import { getDbCollection } from "../../services/mongodb/mongodbService";

useMongo();

describe("Users routes", () => {
  let app: Server;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    return () => app.close();
  }, 15_000);

  let token: string;

  const certifications = {
    "46X32402_RNCP36491": generateCertificationFixture({
      identifiant: { cfd: "46X32402", rncp: "RNCP36491" },
      periode_validite: {
        debut: new Date("2023-10-11T22:00:00.000+00:00"),
        fin: new Date("2026-08-31T21:59:59.000+00:00"),
        cfd: {
          ouverture: new Date("2008-08-31T22:00:00.000+00:00"),
          fermeture: new Date("2026-08-31T21:59:59.000+00:00"),
          premiere_session: 2008,
          derniere_session: 2026,
        },
        rncp: {
          actif: true,
          activation: new Date("2023-10-11T22:00:00.000+00:00"),
          fin_enregistrement: new Date("2026-08-31T21:59:59.000+00:00"),
          debut_parcours: new Date("2023-08-31T22:00:00.000+00:00"),
        },
      },
      base_legale: {
        cfd: {
          creation: new Date("2008-12-31T23:00:00.000+00:00"),
          abrogation: new Date("2024-12-31T22:59:59.000+00:00"),
        },
      },
      created_at: new Date("2021-09-11T22:00:00.000+00:00"),
      updated_at: new Date("2021-10-11T22:00:00.000+00:00"),
    }),
    "3553260B_null": generateCertificationFixture({
      identifiant: { cfd: "3553260B", rncp: null },
    }),
    "3553260B_RNCP21529": generateCertificationFixture({
      identifiant: { cfd: "3553260B", rncp: "RNCP21529" },
    }),
    null_RNCP36092: generateCertificationFixture({
      identifiant: { cfd: null, rncp: "RNCP36092" },
    }),
    null_RNCP10013: generateCertificationFixture({
      identifiant: { cfd: null, rncp: "RNCP10013" },
    }),
    "20512008_RNCP24420": generateCertificationFixture({
      identifiant: { cfd: "20512008", rncp: "RNCP24420" },
    }),
    "13512840_null": generateCertificationFixture({
      identifiant: { cfd: "13512840", rncp: null },
    }),
  } satisfies Record<string, ICertification>;

  const toLocalDateString = (date: Date | null) =>
    date === null ? null : DateTime.fromJSDate(date, { zone: "Europe/Paris" }).toISO();

  const toExpectedJson = ({ _id, updated_at: _u, created_at: _c, ...rest }: ICertification) => {
    return {
      ...rest,
      periode_validite: {
        ...rest.periode_validite,
        debut: toLocalDateString(rest.periode_validite.debut),
        fin: toLocalDateString(rest.periode_validite.fin),
        cfd:
          rest.periode_validite.cfd === null
            ? null
            : {
                ...rest.periode_validite.cfd,
                ouverture: toLocalDateString(rest.periode_validite.cfd.ouverture),
                fermeture: toLocalDateString(rest.periode_validite.cfd.fermeture),
              },
        rncp:
          rest.periode_validite.rncp === null
            ? null
            : {
                ...rest.periode_validite.rncp,
                activation: toLocalDateString(rest.periode_validite.rncp.activation),
                fin_enregistrement: toLocalDateString(rest.periode_validite.rncp.fin_enregistrement),
                debut_parcours: toLocalDateString(rest.periode_validite.rncp.debut_parcours),
              },
      },
      base_legale: {
        ...rest.base_legale,
        cfd:
          rest.base_legale.cfd === null
            ? null
            : {
                ...rest.base_legale.cfd,
                creation: toLocalDateString(rest.base_legale.cfd.creation),
                abrogation: toLocalDateString(rest.base_legale.cfd.abrogation),
              },
      },
    };
  };

  beforeEach(async () => {
    const user = await createUser({
      email: "user@exemple.fr",
      password: "my-password",
      is_admin: false,
    });
    token = await generateApiKey(user);
    await getDbCollection("certifications").insertMany(Object.values(certifications));
  });

  it("should returns 401 if api key is not provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/certification/v1",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Unauthorized",
    });
  });

  it("should returns 401 if api key is invalid", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/certification/v1",
      headers: {
        Authorization: `Bearer ${token}invalid`,
      },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      name: "Unauthorized",
      message: "Unauthorized",
    });
  });

  it.each([
    ["", Object.values(certifications)],
    ["?identifiant.cfd=3553260B", [certifications["3553260B_null"], certifications["3553260B_RNCP21529"]]],
    ["?identifiant.cfd=00000000", []],
    ["?identifiant.cfd=", [certifications["null_RNCP10013"], certifications["null_RNCP36092"]]],
    ["?identifiant.cfd=null", [certifications["null_RNCP10013"], certifications["null_RNCP36092"]]],
    ["?identifiant.rncp=RNCP36491", [certifications["46X32402_RNCP36491"]]],
    ["?identifiant.rncp=RNCP000", []],
    ["?identifiant.rncp=", [certifications["13512840_null"], certifications["3553260B_null"]]],
    ["?identifiant.rncp=null", [certifications["13512840_null"], certifications["3553260B_null"]]],
    ["?identifiant.cfd=3553260B&identifiant.rncp=RNCP21529", [certifications["3553260B_RNCP21529"]]],
  ])('should perform search "%s" correctly', async (search, expected) => {
    const response = await app.inject({
      method: "GET",
      url: `/api/certification/v1${search}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result).toHaveLength(expected.length);
    expect.soft(result).toEqual(expect.arrayContaining(expected.map(toExpectedJson)));
  });

  it("should return localised date string", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/certification/v1?identifiant.cfd=46X32402&identifiant.rncp=RNCP36491",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect.soft(response.statusCode).toBe(200);
    const result = response.json();
    expect.soft(result.at(0).periode_validite).toEqual({
      debut: "2023-10-12T00:00:00.000+02:00",
      fin: "2026-08-31T23:59:59.000+02:00",
      cfd: expect.objectContaining({
        ouverture: "2008-09-01T00:00:00.000+02:00",
        fermeture: "2026-08-31T23:59:59.000+02:00",
      }),
      rncp: expect.objectContaining({
        activation: "2023-10-12T00:00:00.000+02:00",
        fin_enregistrement: "2026-08-31T23:59:59.000+02:00",
        debut_parcours: "2023-09-01T00:00:00.000+02:00",
      }),
    });
    expect.soft(result.at(0).base_legale).toEqual({
      cfd: expect.objectContaining({
        creation: "2009-01-01T00:00:00.000+01:00",
        abrogation: "2024-12-31T23:59:59.000+01:00",
      }),
    });
  });
});
