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
      code: { cfd: "46X32402", rncp: "RNCP36491" },
      periode_validite: {
        debut: new Date("2023-10-11T22:00:00.000+00:00"),
        fin: new Date("2026-08-31T21:59:59.000+00:00"),
      },
      cfd: {
        ouverture: new Date("2008-08-31T22:00:00.000+00:00"),
        fermeture: new Date("2026-08-31T21:59:59.000+00:00"),
        creation: new Date("2008-12-31T23:00:00.000+00:00"),
        abrogation: new Date("2024-12-31T22:59:59.000+00:00"),
      },
      rncp: {
        activation: new Date("2023-10-11T22:00:00.000+00:00"),
        fin_enregistrement: new Date("2026-08-31T21:59:59.000+00:00"),
        debut_parcours: new Date("2023-08-31T22:00:00.000+00:00"),
      },
      created_at: new Date("2021-09-11T22:00:00.000+00:00"),
      updated_at: new Date("2021-10-11T22:00:00.000+00:00"),
    }),
    "3553260B_null": generateCertificationFixture({
      code: { cfd: "3553260B", rncp: null },
    }),
    "3553260B_RNCP21529": generateCertificationFixture({
      code: { cfd: "3553260B", rncp: "RNCP21529" },
    }),
    null_RNCP36092: generateCertificationFixture({
      code: { cfd: null, rncp: "RNCP36092" },
    }),
    null_RNCP10013: generateCertificationFixture({
      code: { cfd: null, rncp: "RNCP10013" },
    }),
    "20512008_RNCP24420": generateCertificationFixture({
      code: { cfd: "20512008", rncp: "RNCP24420" },
    }),
    "13512840_null": generateCertificationFixture({
      code: { cfd: "13512840", rncp: null },
    }),
  } satisfies Record<string, ICertification>;

  const toLocalDateString = (date: Date | null) => (date === null ? null : DateTime.fromJSDate(date).toISO());

  const toExpectedJson = ({ _id, ...rest }: ICertification) => {
    return {
      ...rest,
      periode_validite: {
        debut: toLocalDateString(rest.periode_validite.debut),
        fin: toLocalDateString(rest.periode_validite.fin),
      },
      cfd:
        rest.cfd === null
          ? null
          : {
              ...rest.cfd,
              ouverture: toLocalDateString(rest.cfd.ouverture),
              fermeture: toLocalDateString(rest.cfd.fermeture),
              creation: toLocalDateString(rest.cfd.creation),
              abrogation: toLocalDateString(rest.cfd.abrogation),
            },
      rncp:
        rest.rncp === null
          ? null
          : {
              ...rest.rncp,
              activation: toLocalDateString(rest.rncp.activation),
              fin_enregistrement: toLocalDateString(rest.rncp.fin_enregistrement),
              debut_parcours: toLocalDateString(rest.rncp.debut_parcours),
            },
      created_at: rest.created_at.toISOString(),
      updated_at: rest.updated_at.toISOString(),
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
    ["?code.cfd=3553260B", [certifications["3553260B_null"], certifications["3553260B_RNCP21529"]]],
    ["?code.cfd=00000000", []],
    ["?code.cfd=", [certifications["null_RNCP10013"], certifications["null_RNCP36092"]]],
    ["?code.cfd=null", [certifications["null_RNCP10013"], certifications["null_RNCP36092"]]],
    ["?code.rncp=RNCP36491", [certifications["46X32402_RNCP36491"]]],
    ["?code.rncp=RNCP000", []],
    ["?code.rncp=", [certifications["13512840_null"], certifications["3553260B_null"]]],
    ["?code.rncp=null", [certifications["13512840_null"], certifications["3553260B_null"]]],
    ["?code.cfd=3553260B&code.rncp=RNCP21529", [certifications["3553260B_RNCP21529"]]],
  ])("should perform search %s correctly", async (search, expected) => {
    const response = await app.inject({
      method: "GET",
      url: `/api/certification/v1${search}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expected.map(toExpectedJson));
  });

  it("should return localised date string", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/certification/v1?code.cfd=46X32402&code.rncp=RNCP36491",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().at(0).periode_validite).toEqual({
      debut: "2023-10-12T00:00:00.000+02:00",
      fin: "2026-08-31T23:59:59.000+02:00",
    });
    expect(response.json().at(0).cfd).toEqual(
      expect.objectContaining({
        ouverture: "2008-09-01T00:00:00.000+02:00",
        fermeture: "2026-08-31T23:59:59.000+02:00",
        creation: "2009-01-01T00:00:00.000+01:00",
        abrogation: "2024-12-31T23:59:59.000+01:00",
      })
    );
    expect(response.json().at(0).rncp).toEqual(
      expect.objectContaining({
        activation: "2023-10-12T00:00:00.000+02:00",
        fin_enregistrement: "2026-08-31T23:59:59.000+02:00",
        debut_parcours: "2023-09-01T00:00:00.000+02:00",
      })
    );
  });
});
