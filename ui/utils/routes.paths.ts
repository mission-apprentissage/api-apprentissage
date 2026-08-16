import type { Lang } from "@/app/i18n/settings"

/**
 * Chemins des pages et prédicats de routage, isolés de `routes.utils.ts`.
 *
 * Ce module est importé par `proxy.ts`, que Next compile dans un bundle séparé. Il ne doit
 * dépendre de rien qui tire `api-alternance-sdk/internal` : ce barrel réexporte aussi le
 * générateur OpenAPI, qui importe `crypto` et `path` — sans aucun rapport avec le routage,
 * mais présents dans le graphe de modules du proxy.
 *
 * `routes.utils.ts` compose `PAGES.static` à partir de `PAGE_PATHS` : les chemins ne sont
 * définis qu'ici.
 */

export interface IPagePath {
  getPath: (lang: Lang) => string
  index: boolean
}

export const PAGE_PATHS = {
  home: {
    getPath: (lang: Lang) => `/${lang}` as string,
    index: true,
  },
  documentationTechnique: {
    getPath: (lang: Lang) => `/${lang}/documentation-technique` as string,
    index: true,
  },
  documentationTechniqueEssayer: {
    getPath: (lang: Lang) => `/${lang}/documentation-technique/try` as string,
    index: true,
  },
  explorerApi: {
    getPath: (lang: Lang) => `/${lang}/explorer` as string,
    index: true,
  },
  catalogueDesDonneesCertification: {
    getPath: (lang: Lang) => `/${lang}/explorer/certifications` as string,
    index: true,
  },
  rechercheOffre: {
    getPath: (lang: Lang) => `/${lang}/explorer/recherche-offre` as string,
    index: true,
  },
  recuperationDetailOffre: {
    getPath: (lang: Lang) => `/${lang}/explorer/recuperation-detail-offre` as string,
    index: true,
  },
  rechercheCommune: {
    getPath: (lang: Lang) => `/${lang}/explorer/recherche-commune` as string,
    index: true,
  },
  rechercheFormation: {
    getPath: (lang: Lang) => `/${lang}/explorer/recherche-formation` as string,
    index: true,
  },
  recuperationFormation: {
    getPath: (lang: Lang) => `/${lang}/explorer/recuperation-formation` as string,
    index: true,
  },
  generationLienPriseRdvFormation: {
    getPath: (lang: Lang) => `/${lang}/explorer/generation-lien-prise-rdv-formation` as string,
    index: true,
  },
  recuperationDepartements: {
    getPath: (lang: Lang) => `/${lang}/explorer/recuperation-departements` as string,
    index: true,
  },
  recuperationMissionLocales: {
    getPath: (lang: Lang) => `/${lang}/explorer/recuperation-mission-locales` as string,
    index: true,
  },
  recuperationOrganismes: {
    getPath: (lang: Lang) => `/${lang}/explorer/recuperation-organismes` as string,
    index: true,
  },
  depotOffre: {
    getPath: (lang: Lang) => `/${lang}/explorer/depot-offre` as string,
    index: true,
  },
  candidatureOffre: {
    getPath: (lang: Lang) => `/${lang}/explorer/candidature-offre` as string,
    index: true,
  },
  mentionsLegales: {
    getPath: (lang: Lang) => `/${lang}/mentions-legales` as string,
    index: true,
  },
  accessibilite: {
    getPath: (lang: Lang) => `/${lang}/accessibilite` as string,
    index: true,
  },
  cgu: {
    getPath: (lang: Lang) => `/${lang}/cgu` as string,
    index: true,
  },
  politiqueConfidentialite: {
    getPath: (lang: Lang) => `/${lang}/politique-confidentialite` as string,
    index: true,
  },
  compteProfil: {
    getPath: (lang: Lang) => `/${lang}/compte/profil` as string,
    index: true,
  },
  adminUsers: {
    getPath: (lang: Lang) => `/${lang}/admin/utilisateurs` as string,
    index: false,
  },
  adminOrganisations: {
    getPath: (lang: Lang) => `/${lang}/admin/organisations` as string,
    index: false,
  },
  adminProcessor: {
    getPath: (lang: Lang) => `/${lang}/admin/processeur` as string,
    index: false,
  },
  adminImporters: {
    getPath: (lang: Lang) => `/${lang}/admin/importers` as string,
    index: false,
  },
} as const satisfies Record<string, IPagePath>

export function getRawPath(pathname: string): string {
  const rawPath = pathname.replace(/^\/fr/, "").replace(/^\/en/, "")
  return rawPath === "" ? "/" : rawPath
}

export function isStaticPage(pathname: string): boolean {
  return Object.values(PAGE_PATHS).some((page) => getRawPath(page.getPath("fr")) === pathname)
}

export function isDynamicPage(pathname: string): boolean {
  if (pathname === "/auth/inscription") {
    return true
  }
  if (pathname === "/auth/refus-inscription") {
    return true
  }
  if (/^\/admin\/utilisateurs\/[^/]+$/.test(pathname)) {
    return true
  }
  if (/^\/admin\/organisations\/[^/]+$/.test(pathname)) {
    return true
  }
  if (/^\/admin\/processeur\/job\/[^/]+$/.test(pathname)) {
    return true
  }
  if (/^\/admin\/processeur\/job\/[^/]+\/[^/]+$/.test(pathname)) {
    return true
  }
  if (/^\/admin\/processeur\/cron\/[^/]+$/.test(pathname)) {
    return true
  }
  if (/^\/admin\/processeur\/cron\/[^/]+\/[^/]+$/.test(pathname)) {
    return true
  }
  if (/^\/admin\/importers\/[^/]+$/.test(pathname)) {
    return true
  }

  return false
}

export function isNotionPage(pathname: string): boolean {
  return pathname.startsWith("/doc/") || /^\/notion\/[^/]+$/.test(pathname)
}

export function isPage(pathname: string): boolean {
  return isStaticPage(pathname) || isDynamicPage(pathname) || isNotionPage(pathname)
}
