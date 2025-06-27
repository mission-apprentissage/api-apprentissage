import jwt from "jsonwebtoken";
import { z } from "zod/v4-mini";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export const zApiAlternanceTokenData = z.object({
  email: z.string().check(z.email()),
  organisation: z.nullable(z.string()),
  habilitations: z.record(z.string(), z.boolean()),
});

export type IApiAlternanceTokenData = z.output<typeof zApiAlternanceTokenData>;

type IParseApiAlternanceTokenParams = {
  token: string;
  publicKey: string;
};

type IParseApiAlternanceTokenResult =
  | {
      success: true;
      data: IApiAlternanceTokenData;
    }
  | {
      success: false;
      reason: "token-expired" | "invalid-signature" | "invalid-format" | "missing-bearer";
    };

const bearerRegex = /^bearer\s+(\S+)$/i;
function extractBearerToken(authorization: string): null | string {
  const matches = authorization.match(bearerRegex);
  return matches === null ? null : matches[1];
}

export function parseApiAlternanceToken(params: IParseApiAlternanceTokenParams): IParseApiAlternanceTokenResult {
  try {
    const token = extractBearerToken(params.token);

    if (!token) {
      return {
        success: false,
        reason: "missing-bearer",
      };
    }

    const { payload } = jwt.verify(token, params.publicKey, {
      complete: true,
      algorithms: ["ES512"],
    });

    const parseResult = zApiAlternanceTokenData.safeParse(payload);
    if (!parseResult.success) {
      return {
        success: false,
        reason: "invalid-format",
      };
    }

    return {
      success: true,
      data: parseResult.data,
    };
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      return {
        success: false,
        reason: "token-expired",
      };
    }

    if (err instanceof JsonWebTokenError) {
      return {
        success: false,
        reason: "invalid-signature",
      };
    }

    throw err;
  }
}

type ICreateApiAlternanceTokenParams = {
  data: IApiAlternanceTokenData;
  privateKey: string;
  expiresIn?: string | null;
};

export function createApiAlternanceToken({ data, privateKey, expiresIn }: ICreateApiAlternanceTokenParams): string {
  return jwt.sign(data, privateKey, {
    algorithm: "ES512",
    expiresIn: expiresIn || "1h",
  });
}
