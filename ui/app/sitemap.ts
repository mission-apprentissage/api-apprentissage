import { MetadataRoute } from "next";

import { publicConfig } from "../config.public";
import { Page, PAGES } from "./components/breadcrumb/Breadcrumb";

function getSitemapItem(page: Page): MetadataRoute.Sitemap[number] {
  return {
    url: `${publicConfig.baseUrl}${page.path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    getSitemapItem(PAGES.homepage()),
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
