export const contentSecurityPolicy = `
      default-src 'self' https://plausible.io;
      base-uri 'self';
      block-all-mixed-content;
      font-src 'self' https: data:;
      frame-ancestors 'self';
      frame-src 'self' https://plausible.io;
      img-src 'self' https://www.notion.so data: ;
      object-src 'none';
      script-src 'self' https://plausible.io 'unsafe-inline' ${
        process.env.NEXT_PUBLIC_ENV === "local" ? "'unsafe-eval'" : ""
      };
      script-src-attr 'none';
      style-src 'self' https:  https: *.plausible.io 'unsafe-inline';
      connect-src 'self' https://geo.api.gouv.fr/ https://plausible.io  https://sentry.apprentissage.beta.gouv.fr ${
        process.env.NEXT_PUBLIC_ENV === "local" ? "http://localhost:5001/" : ""
      };
      upgrade-insecure-requests;
`;

export function inline(value) {
  return value.replace(/\s{2,}/g, " ").trim();
}
