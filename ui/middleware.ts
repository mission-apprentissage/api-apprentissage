import { NextRequest, NextResponse } from "next/server";

import { contentSecurityPolicy, inline } from "./csp.mjs";

export function middleware(request: NextRequest) {
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

  return response;
}

export const config = {
  matcher: ["/documentation-technique"],
};
