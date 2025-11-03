import acceptLanguage from "accept-language";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Lang } from "./app/i18n/settings";
import { cookieName, isValidLang, languages } from "./app/i18n/settings";
import { isPage } from "./utils/routes.utils";

acceptLanguage.languages([...languages]);

const contentSecurityPolicy = `
      default-src 'self' https://plausible.io;
      base-uri 'self';
      block-all-mixed-content;
      font-src 'self' https: data:;
      frame-ancestors 'self' https://*.data.gouv.fr;
      frame-src 'self' https://plausible.io;
      img-src 'self' https://cdn.redoc.ly https://www.notion.so data: blob:;
      object-src 'none';
      script-src 'self' https://plausible.io 'unsafe-inline' 'unsafe-eval' ${
        process.env.NEXT_PUBLIC_ENV === "local" ? "'unsafe-eval'" : ""
      };
      script-src-attr 'none';
      style-src 'self' https:  https: *.plausible.io 'unsafe-inline';
      connect-src 'self' https://geo.api.gouv.fr/ https://plausible.io  https://sentry.apprentissage.beta.gouv.fr https://*.data.gouv.fr ${
        process.env.NEXT_PUBLIC_ENV === "local" ? `http://localhost:${process.env.NEXT_PUBLIC_API_PORT}/` : ""
      };
      upgrade-insecure-requests;
`;

function inline(value: string) {
  return value.replace(/\s{2,}/g, " ").trim();
}

function guessLang(request: NextRequest): Lang {
  const pathname = request.nextUrl.pathname;

  if (isLocalisedPath(pathname)) {
    return pathname.split("/")[1] as Lang;
  }

  const cookie = request.cookies.get(cookieName)?.value;
  if (isValidLang(cookie)) {
    return cookie;
  }

  const acceptLang = acceptLanguage.get(request.headers.get("accept-language"));

  return isValidLang(acceptLang) ? acceptLang : languages[0];
}

function isLocalisedPath(pathname: string) {
  return languages.some((lang) => pathname.startsWith(`/${lang}`));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const lang = guessLang(request);

  if (isPage(pathname)) {
    return NextResponse.redirect(new URL(`/${lang}${pathname}${search}`, request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = inline(contentSecurityPolicy + ` worker-src 'self' 'nonce-${nonce}' 'strict-dynamic';`);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", cspHeader);

  if (isLocalisedPath(pathname)) {
    response.cookies.set(cookieName, lang, { secure: true, sameSite: "strict", path: "/" });
  }

  return response;
}
