import { MetadataRoute } from "next";

import { publicConfig } from "../config.public";
import { NOTION_PAGES, Page, PAGES } from "./components/breadcrumb/Breadcrumb";

function getSitemapItem(page: Page): MetadataRoute.Sitemap[number] {
  return {
    url: `${publicConfig.baseUrl}${page.path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    getSitemapItem(PAGES.homepage()),
    getSitemapItem(NOTION_PAGES.donnees_disponibles),
    getSitemapItem(NOTION_PAGES["/donnees/certifications_professionnelles"]),
    getSitemapItem(NOTION_PAGES["/donnees/diplomes_titres"]),
    getSitemapItem(NOTION_PAGES["/donnees/correspondance_RNCP_CFD"]),
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
