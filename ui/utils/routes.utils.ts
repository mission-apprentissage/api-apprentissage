import type { TFunction } from "i18next";
import type { MetadataRoute } from "next";

import type { Lang, Namespace } from "@/app/i18n/settings";
import { publicConfig } from "@/config.public";

export interface IPage {
  path: string;
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
      path: "/" as string,
      index: true,
      getTitle: (lang, t) => t("pages.home", { lang, ns: "global" }),
    },
    documentationTechnique: {
      path: "/documentation-technique" as string,
      index: true,
      getTitle: (lang, t) => t("pages.documentationTechnique", { lang, ns: "global" }),
    },
    documentationTechniqueEssayer: {
      path: "/documentation-technique/try" as string,
      index: true,
      getTitle: (lang, t) => t("pages.documentationTechniqueEssayer", { lang, ns: "global" }),
    },
    explorerApi: {
      path: "/explorer" as string,
      index: true,
      getTitle: (lang, t) => t("pages.explorerApi", { lang, ns: "global" }),
    },
    catalogueDesDonneesCertification: {
      path: "/explorer/certifications" as string,
      index: true,
      getTitle: (lang, t) => t("pages.catalogueDesDonneesCertification", { lang, ns: "global" }),
    },
    simulateurNpec: {
      path: "/explorer/simulateur-npec" as string,
      index: true,
      getTitle: (lang, t) => t("pages.simulateurNpec", { lang, ns: "global" }),
    },
    depotOffre: {
      path: "/explorer/depot-offre" as string,
      index: true,
      getTitle: (lang, t) => t("pages.depotOffre", { lang, ns: "global" }),
    },
    mentionsLegales: {
      path: "/mentions-legales" as string,
      index: true,
      getTitle: (lang, t) => t("pages.mentionsLegales", { lang, ns: "global" }),
    },
    accessibilite: {
      path: "/accessibilite" as string,
      index: true,
      getTitle: (lang, t) => t("pages.accessibilite", { lang, ns: "global" }),
    },
    cgu: {
      path: "/cgu" as string,
      index: true,
      getTitle: (lang, t) => t("pages.cgu", { lang, ns: "global" }),
    },
    donneesPersonnelles: {
      path: "/donnees-personnelles" as string,
      index: true,
      getTitle: (lang, t) => t("pages.donneesPersonnelles", { lang, ns: "global" }),
    },
    politiqueConfidentialite: {
      path: "/politique-confidentialite" as string,
      index: true,
      getTitle: (lang, t) => t("pages.politiqueConfidentialite", { lang, ns: "global" }),
    },
    compteProfil: {
      path: "/compte/profil" as string,
      index: true,
      getTitle: (lang, t) => t("pages.compteProfil", { lang, ns: "global" }),
    },
    adminUsers: {
      path: "/admin/utilisateurs" as string,
      index: false,
      getTitle: (lang, t) => t("pages.adminUsers", { lang, ns: "global" }),
    },
    adminOrganisations: {
      path: "/admin/organisations" as string,
      index: false,
      getTitle: (lang, t) => t("pages.adminOrganisations", { lang, ns: "global" }),
    },
    adminProcessor: {
      path: "/admin/processeur" as string,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessor", { lang, ns: "global" }),
    },
  },
  dynamic: {
    inscription: (token: string): IPage => ({
      path: `/auth/inscription?token=${token}`,
      index: false,
      getTitle: (lang, t) => t("pages.inscription", { lang, ns: "global" }),
    }),
    refusInscription: (token: string): IPage => ({
      path: `/auth/refus-inscription?token=${token}`,
      index: false,
      getTitle: (lang, t) => t("pages.refusInscription", { lang, ns: "global" }),
    }),
    adminUserView: (id: string): IPage => ({
      path: `/admin/utilisateurs/${id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminUserView", { lang, ns: "global" }),
    }),
    adminOrganisationView: (id: string): IPage => ({
      path: `/admin/organisations/${id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminOrganisationView", { lang, ns: "global" }),
    }),
    adminProcessorJob: (name: string): IPage => ({
      path: `/admin/processeur/job/${name}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorJob", { lang, name, ns: "global" }),
    }),
    adminProcessorJobInstance: (params: { name: string; id: string }): IPage => ({
      path: `/admin/processeur/job/${params.name}/${params.id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorJobInstance", { lang, id: params.id, ns: "global" }),
    }),
    adminProcessorCron: (name: string): IPage => ({
      path: `/admin/processeur/cron/${name}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorCron", { lang, name, ns: "global" }),
    }),
    adminProcessorCronTask: (params: { name: string; id: string }): IPage => ({
      path: `/admin/processeur/cron/${params.name}/${params.id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminProcessorCronTask", { lang, id: params.id, ns: "global" }),
    }),
  },
  notion: {},
} as const satisfies IPages;

export function isStaticPage(pathname: string): boolean {
  return Object.values(PAGES.static).some((page) => page.path === pathname);
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
    url: `${publicConfig.baseUrl}${page.path}`,
    alternates: {
      languages: {
        fr: `${publicConfig.baseUrl}/fr${page.path}`,
        en: `${publicConfig.baseUrl}/en${page.path}`,
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
