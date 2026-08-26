import {
  candidatureOffrePageSummaryDoc,
  certificationsPageSummaryDoc,
  depotOffrePageSummaryDoc,
  generationLienPriseRdvFormationPageSummaryDoc,
  getTextOpenAPI,
  rechercheCommunePageSummaryDoc,
  rechercheFormationPageSummaryDoc,
  rechercheOffrePageSummaryDoc,
  recuperationDepartementsPageSummaryDoc,
  recuperationDetailOffrePageSummaryDoc,
  recuperationFormationPageSummaryDoc,
  recuperationMissionLocalePageSummaryDoc,
  recuperationOrganismesPageSummaryDoc,
} from "api-alternance-sdk/internal"
import type { TFunction } from "i18next"
import type { MetadataRoute } from "next"

import type { Lang, Namespace } from "@/app/i18n/settings"
import { publicConfig } from "@/config.public"

import type { IPagePath } from "./routes.paths"
import { getRawPath, PAGE_PATHS } from "./routes.paths"

export interface IPage extends IPagePath {
  getTitle: (lang: Lang, t: TFunction<Namespace>) => string
}

export interface INotionPage extends IPage {
  notionId: string
}

export interface IPages {
  static: Record<string, IPage>
  // `never` plutôt que `any` : cette vue élargie de PAGES ne sert qu'à parcourir `notion`,
  // et chaque constructeur de page dynamique garde son propre type de paramètres.
  dynamic: Record<string, (params: never) => IPage>
  notion: Record<string, INotionPage>
}

export const PAGES = {
  static: {
    home: {
      ...PAGE_PATHS.home,
      getTitle: (lang, t) => t("pages.home", { lang, ns: "global" }),
    },
    documentationTechnique: {
      ...PAGE_PATHS.documentationTechnique,
      getTitle: (lang, t) => t("pages.documentationTechnique", { lang, ns: "global" }),
    },
    documentationTechniqueEssayer: {
      ...PAGE_PATHS.documentationTechniqueEssayer,
      getTitle: (lang, t) => t("pages.documentationTechniqueEssayer", { lang, ns: "global" }),
    },
    explorerApi: {
      ...PAGE_PATHS.explorerApi,
      getTitle: (lang, t) => t("pages.explorerApi", { lang, ns: "global" }),
    },
    catalogueDesDonneesCertification: {
      ...PAGE_PATHS.catalogueDesDonneesCertification,
      getTitle: (lang, _t) => getTextOpenAPI(certificationsPageSummaryDoc.title, lang),
    },
    rechercheOffre: {
      ...PAGE_PATHS.rechercheOffre,
      getTitle: (lang, _t) => getTextOpenAPI(rechercheOffrePageSummaryDoc.title, lang),
    },
    recuperationDetailOffre: {
      ...PAGE_PATHS.recuperationDetailOffre,
      getTitle: (lang, _t) => getTextOpenAPI(recuperationDetailOffrePageSummaryDoc.title, lang),
    },
    rechercheCommune: {
      ...PAGE_PATHS.rechercheCommune,
      getTitle: (lang, _t) => getTextOpenAPI(rechercheCommunePageSummaryDoc.title, lang),
    },
    rechercheFormation: {
      ...PAGE_PATHS.rechercheFormation,
      getTitle: (lang, _t) => getTextOpenAPI(rechercheFormationPageSummaryDoc.title, lang),
    },
    recuperationFormation: {
      ...PAGE_PATHS.recuperationFormation,
      getTitle: (lang, _t) => getTextOpenAPI(recuperationFormationPageSummaryDoc.title, lang),
    },
    generationLienPriseRdvFormation: {
      ...PAGE_PATHS.generationLienPriseRdvFormation,
      getTitle: (lang, _t) => getTextOpenAPI(generationLienPriseRdvFormationPageSummaryDoc.title, lang),
    },
    recuperationDepartements: {
      ...PAGE_PATHS.recuperationDepartements,
      getTitle: (lang, _t) => getTextOpenAPI(recuperationDepartementsPageSummaryDoc.title, lang),
    },
    recuperationMissionLocales: {
      ...PAGE_PATHS.recuperationMissionLocales,
      getTitle: (lang, _t) => getTextOpenAPI(recuperationMissionLocalePageSummaryDoc.title, lang),
    },
    recuperationOrganismes: {
      ...PAGE_PATHS.recuperationOrganismes,
      getTitle: (lang, _t) => getTextOpenAPI(recuperationOrganismesPageSummaryDoc.title, lang),
    },
    depotOffre: {
      ...PAGE_PATHS.depotOffre,
      getTitle: (lang, _t) => getTextOpenAPI(depotOffrePageSummaryDoc.title, lang),
    },
    candidatureOffre: {
      ...PAGE_PATHS.candidatureOffre,
      getTitle: (lang, _t) => getTextOpenAPI(candidatureOffrePageSummaryDoc.title, lang),
    },
    mentionsLegales: {
      ...PAGE_PATHS.mentionsLegales,
      getTitle: (lang, t) => t("pages.mentionsLegales", { lang, ns: "global" }),
    },
    accessibilite: {
      ...PAGE_PATHS.accessibilite,
      getTitle: (lang, t) => t("pages.accessibilite", { lang, ns: "global" }),
    },
    cgu: {
      ...PAGE_PATHS.cgu,
      getTitle: (lang, t) => t("pages.cgu", { lang, ns: "global" }),
    },
    politiqueConfidentialite: {
      ...PAGE_PATHS.politiqueConfidentialite,
      getTitle: (lang, t) => t("pages.politiqueConfidentialite", { lang, ns: "global" }),
    },
    compteProfil: {
      ...PAGE_PATHS.compteProfil,
      getTitle: (lang, t) => t("pages.compteProfil", { lang, ns: "global" }),
    },
    adminUsers: {
      ...PAGE_PATHS.adminUsers,
      getTitle: (lang, t) => t("pages.adminUsers", { lang, ns: "global" }),
    },
    adminOrganisations: {
      ...PAGE_PATHS.adminOrganisations,
      getTitle: (lang, t) => t("pages.adminOrganisations", { lang, ns: "global" }),
    },
    adminProcessor: {
      ...PAGE_PATHS.adminProcessor,
      getTitle: (lang, t) => t("pages.adminProcessor", { lang, ns: "global" }),
    },
    adminImporters: {
      ...PAGE_PATHS.adminImporters,
      getTitle: (lang, t) => t("pages.adminImporters", { lang, ns: "global" }),
    },
  },
  dynamic: {
    inscription: (token: string): IPage => ({
      getPath: (lang) => `/${lang}/auth/inscription?token=${token}`,
      index: false,
      getTitle: (lang, t) => t("pages.inscription", { lang, ns: "global" }),
    }),
    adminUserView: (id: string): IPage => ({
      getPath: (lang) => `/${lang}/admin/utilisateurs/${id}`,
      index: false,
      getTitle: (lang, t) => t("pages.adminUserView", { lang, ns: "global" }),
    }),
    adminImporterView: (name: string): IPage => ({
      getPath: (lang) => `/${lang}/admin/importers/${name}` as string,
      index: false,
      getTitle: () => name,
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
} as const satisfies IPages

function getSitemapItem(page: IPage): MetadataRoute.Sitemap[number] {
  return {
    url: `${publicConfig.baseUrl}${getRawPath(page.getPath("fr"))}`,
    alternates: {
      languages: {
        fr: `${publicConfig.baseUrl}${page.getPath("fr")}`,
        en: `${publicConfig.baseUrl}${page.getPath("en")}`,
      },
    },
  }
}

export function getSitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES.static)
    .filter((page) => page.index)
    .map(getSitemapItem)
}
