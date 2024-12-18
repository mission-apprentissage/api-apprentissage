import type { TFunction } from "i18next";
import type { MetadataRoute } from "next";

import type { Lang, Namespace } from "@/app/i18n/settings";
import { publicConfig } from "@/config.public";

export interface IPage {
  getPath: (lang: Lang) => string;
  index: boolean;
  getTitle: (lang: Lang, t: TFunction<Namespace>) => string;
}

export interface INotionPage extends IPage {
  notionId: string;
}

export interface IPages {
  static: Record<string, IPage>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamic: Record<string, (params: any) => IPage>;
  notion: Record<string, INotionPage>;
}

export const PAGES = {
  static: {
    home: {
      getPath: (lang) => `/${lang}` as string,
      index: true,
      getTitle: (lang, t) => t("pages.home", { lang, ns: "global" }),
    },
    documentationTechnique: {
      getPath: (lang) => `/${lang}/documentation-technique` as string,
      index: true,
      getTitle: (lang, t) => t("pages.documentationTechnique", { lang, ns: "global" }),
    },
    documentationTechniqueEssayer: {
      getPath: (lang) => `/${lang}/documentation-technique/try` as string,
      index: true,
      getTitle: (lang, t) => t("pages.documentationTechniqueEssayer", { lang, ns: "global" }),
    },
    explorerApi: {
      getPath: (lang) => `/${lang}/explorer` as string,
      index: true,
      getTitle: (lang, t) => t("pages.explorerApi", { lang, ns: "global" }),
    },
    catalogueDesDonneesCertification: {
      getPath: (lang) => `/${lang}/explorer/certifications` as string,
      index: true,
      getTitle: (lang, t) => t("pages.catalogueDesDonneesCertification", { lang, ns: "global" }),
    },
    simulateurNpec: {
      getPath: (lang) => `/${lang}/explorer/simulateur-npec` as string,
      index: true,
      getTitle: (lang, t) => t("pages.simulateurNpec", { lang, ns: "global" }),
    },
    rechercheOffre: {
      getPath: (lang) => `/${lang}/explorer/recherche-offre` as string,
      index: true,
      getTitle: (lang, t) => t("pages.rechercheOffre", { lang, ns: "global" }),
    },
    rechercheCommune: {
      getPath: (lang) => `/${lang}/explorer/recherche-commune` as string,
      index: true,
      getTitle: (lang, t) => t("pages.rechercheCommune", { lang, ns: "global" }),
    },
    recuperationDepartements: {
      getPath: (lang) => `/${lang}/explorer/recuperation-departements` as string,
      index: true,
      getTitle: (lang, t) => t("pages.recuperationDepartements", { lang, ns: "global" }),
    },
    recuperationMissionLocales: {
      getPath: (lang) => `/${lang}/explorer/recuperation-mission-locales` as string,
      index: true,
      getTitle: (lang, t) => t("pages.recuperationMissionLocales", { lang, ns: "global" }),
    },
    depotOffre: {
      getPath: (lang) => `/${lang}/explorer/depot-offre` as string,
      index: true,
      getTitle: (lang, t) => t("pages.depotOffre", { lang, ns: "global" }),
    },
    mentionsLegales: {
      getPath: (lang) => `/${lang}/mentions-legales` as string,
      index: true,
      getTitle: (lang, t) => t("pages.mentionsLegales", { lang, ns: "global" }),
    },
    accessibilite: {
      getPath: (lang) => `/${lang}/accessibilite` as string,
      index: true,
      getTitle: (lang, t) => t("pages.accessibilite", { lang, ns: "global" }),
    },
    cgu: {
      getPath: (lang) => `/${lang}/cgu` as string,
      index: true,
      getTitle: (lang, t) => t("pages.cgu", { lang, ns: "global" }),
    },
    donneesPersonnelles: {
      getPath: (lang) => `/${lang}/donnees-personnelles` as string,
      index: true,
      getTitle: (lang, t) => t("pages.donneesPersonnelles", { lang, ns: "global" }),
    },
    politiqueConfidentialite: {
      getPath: (lang) => `/${lang}/politique-confidentialite` as string,
      index: true,
      getTitle: (lang, t) => t("pages.politiqueConfidentialite", { lang, ns: "global" }),
    },
    compteProfil: {
      getPath: (lang) => `/${lang}/compte/profil` as string,
      index: true,
      getTitle: (lang, t) => t("pages.compteProfil", { lang, ns: "global" }),
    },
    adminUsers: {
      getPath: (lang) => `/${lang}/admin/utilisateurs` as string,
      index: false,
      getTitle: (lang, t) => t("pages.adminUsers", { lang, ns: "global" }),
    },
    adminOrganisations: {
      getPath: (lang) => `/${lang}/admin/organisations` as string,
      index: false,
      getTitle: (lang, t) => t("pages.adminOrganisations", { lang, ns: "global" }),
    },
    adminProcessor: {
      getPath: (lang) => `/${lang}/admin/processeur` as string,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessor", { lang, ns: "global" }),
    },
  },
  dynamic: {
    inscription: (token: string): IPage => ({
      getPath: (lang) => `/${lang}/auth/inscription?token=${token}`,
      index: false,
      getTitle: (lang, t) => t("pages.inscription", { lang, ns: "global" }),
    }),
    refusInscription: (token: string): IPage => ({
      getPath: (lang) => `/${lang}/auth/refus-inscription?token=${token}`,
      index: false,
      getTitle: (lang, t) => t("pages.refusInscription", { lang, ns: "global" }),
    }),
    adminUserView: (id: string): IPage => ({
      getPath: (lang) => `/${lang}/admin/utilisateurs/${id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminUserView", { lang, ns: "global" }),
    }),
    adminOrganisationView: (id: string): IPage => ({
      getPath: (lang) => `/${lang}/admin/organisations/${id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminOrganisationView", { lang, ns: "global" }),
    }),
    adminProcessorJob: (name: string): IPage => ({
      getPath: (lang) => `/${lang}/admin/processeur/job/${name}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorJob", { lang, name, ns: "global" }),
    }),
    adminProcessorJobInstance: (params: { name: string; id: string }): IPage => ({
      getPath: (lang) => `/${lang}/admin/processeur/job/${params.name}/${params.id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorJobInstance", { lang, id: params.id, ns: "global" }),
    }),
    adminProcessorCron: (name: string): IPage => ({
      getPath: (lang) => `/${lang}/admin/processeur/cron/${name}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorCron", { lang, name, ns: "global" }),
    }),
    adminProcessorCronTask: (params: { name: string; id: string }): IPage => ({
      getPath: (lang) => `/${lang}/admin/processeur/cron/${params.name}/${params.id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorCronTask", { lang, id: params.id, ns: "global" }),
    }),
  },
  notion: {},
} as const satisfies IPages;

function getRawPath(pathname: string): string {
  const rawPath = pathname.replace(/^\/fr/, "").replace(/^\/en/, "");
  return rawPath === "" ? "/" : rawPath;
}

export function isStaticPage(pathname: string): boolean {
  return Object.values(PAGES.static).some((page) => getRawPath(page.getPath("fr")) === pathname);
}

export function isDynamicPage(pathname: string): boolean {
  if (pathname === "/auth/inscription") {
    return true;
  }
  if (pathname === "/auth/refus-inscription") {
    return true;
  }
  if (/^\/admin\/utilisateurs\/[^/]+$/.test(pathname)) {
    return true;
  }
  if (/^\/admin\/organisations\/[^/]+$/.test(pathname)) {
    return true;
  }
  if (/^\/admin\/processeur\/job\/[^/]+$/.test(pathname)) {
    return true;
  }
  if (/^\/admin\/processeur\/job\/[^/]+\/[^/]+$/.test(pathname)) {
    return true;
  }
  if (/^\/admin\/processeur\/cron\/[^/]+$/.test(pathname)) {
    return true;
  }
  if (/^\/admin\/processeur\/cron\/[^/]+\/[^/]+$/.test(pathname)) {
    return true;
  }

  return false;
}

export function isNotionPage(pathname: string): boolean {
  return pathname.startsWith("/doc/") || /^\/notion\/[^/]+$/.test(pathname);
}

function getSitemapItem(page: IPage): MetadataRoute.Sitemap[number] {
  return {
    url: `${publicConfig.baseUrl}${getRawPath(page.getPath("fr"))}`,
    alternates: {
      languages: {
        fr: `${publicConfig.baseUrl}${page.getPath("fr")}`,
        en: `${publicConfig.baseUrl}${page.getPath("en")}`,
      },
    },
  };
}

export function getSitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES.static)
    .filter((page) => page.index)
    .map(getSitemapItem);
}

export function isPage(pathname: string): boolean {
  return isStaticPage(pathname) || isDynamicPage(pathname) || isNotionPage(pathname);
}
