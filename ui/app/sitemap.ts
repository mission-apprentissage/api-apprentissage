import { MetadataRoute } from "next";

import { NOTION_PAGES, Page, PAGES } from "../components/breadcrumb/Breadcrumb";
import { publicConfig } from "../config.public";

function getSitemapItem(page: Page): MetadataRoute.Sitemap[number] {
  return {
    url: `${publicConfig.baseUrl}${page.path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    getSitemapItem(PAGES.homepage()),
    getSitemapItem(PAGES.documentationTechnique()),
    ...Object.values(NOTION_PAGES).map(getSitemapItem),
    getSitemapItem(PAGES.mentionsLegales()),
    getSitemapItem(PAGES.accessibilite()),
    getSitemapItem(PAGES.cgu()),
    getSitemapItem(PAGES.donneesPersonnelles()),
    getSitemapItem(PAGES.politiqueConfidentialite()),
    getSitemapItem(PAGES.connexion()),
    getSitemapItem(PAGES.motDePasseOublie()),
    getSitemapItem(PAGES.modifierMotDePasse()),
  ];
}
