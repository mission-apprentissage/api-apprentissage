import type { MetadataRoute } from "next";

import { publicConfig } from "@/config.public";

export interface IPage {
  title: string;
  path: string;
  index: boolean;
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
      title: "Accueil",
      path: "/" as string,
      index: true,
    },
    documentationTechnique: {
      title: "Documentation technique",
      path: "/documentation-technique" as string,
      index: true,
    },
    documentationTechniqueEssayer: {
      title: "Essayer l'API",
      path: "/documentation-technique/try" as string,
      index: true,
    },
    explorerApi: {
      title: "Explorer l’API",
      path: "/explorer" as string,
      index: true,
    },
    catalogueDesDonneesCertification: {
      title: "Liste des certifications professionnelles",
      path: "/explorer/certifications" as string,
      index: true,
    },
    simulateurNpec: {
      title: "Simulateur des Niveaux de Prise en Charge (NPEC)",
      path: "/explorer/simulateur-npec" as string,
      index: true,
    },
    mentionsLegales: {
      title: "Mentions Légales",
      path: "/mentions-legales" as string,
      index: true,
    },
    accessibilite: {
      title: "Accessibilité",
      path: "/accessibilite" as string,
      index: true,
    },
    cgu: {
      title: "Conditions Générales d'Utilisation",
      path: "/cgu" as string,
      index: true,
    },
    donneesPersonnelles: {
      title: "Données Personnelles",
      path: "/donnees-personnelles" as string,
      index: true,
    },
    politiqueConfidentialite: {
      title: "Politique de Confidentialité",
      path: "/politique-confidentialite" as string,
      index: true,
    },
    compteProfil: {
      title: "Mon profil",
      path: "/compte/profil" as string,
      index: true,
    },
    adminUsers: {
      title: "Gestion des utilisateurs",
      path: "/admin/utilisateurs" as string,
      index: false,
    },
    adminOrganisations: {
      title: "Gestion des organisations",
      path: "/admin/organisations" as string,
      index: false,
    },
    adminProcessor: {
      title: "Administration du processeur",
      path: "/admin/processeur" as string,
      index: false,
    },
  },
  dynamic: {
    inscription: (token: string): IPage => ({
      title: "Inscription",
      path: `/auth/inscription?token=${token}`,
      index: false,
    }),
    refusInscription: (token: string): IPage => ({
      title: "Inscription",
      path: `/auth/refus-inscription?token=${token}`,
      index: false,
    }),
    adminUserView: (id: string): IPage => ({
      title: "Fiche utilisateur",
      path: `/admin/utilisateurs/${id}`,
      index: false,
    }),
    adminOrganisationView: (id: string): IPage => ({
      title: `Fiche Organisation`,
      path: `/admin/organisations/${id}`,
      index: false,
    }),
    adminProcessorJob: (name: string): IPage => ({
      title: `Job ${name}`,
      path: `/admin/processeur/job/${name}`,
      index: false,
    }),
    adminProcessorJobInstance: (params: { name: string; id: string }): IPage => ({
      title: `Tâche ${params.id}`,
      path: `/admin/processeur/job/${params.name}/${params.id}`,
      index: false,
    }),
    adminProcessorCron: (name: string): IPage => ({
      title: `CRON ${name}`,
      path: `/admin/processeur/cron/${name}`,
      index: false,
    }),
    adminProcessorCronTask: (params: { name: string; id: string }): IPage => ({
      title: `Tâche ${params.id}`,
      path: `/admin/processeur/cron/${params.name}/${params.id}`,
      index: false,
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
