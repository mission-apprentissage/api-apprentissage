import { MetadataRoute } from "next";

import { publicConfig } from "@/config.public";
import { IPage, PAGES } from "@/utils/routes.utils";

function getSitemapItem(page: IPage): MetadataRoute.Sitemap[number] {
  return {
    url: `${publicConfig.baseUrl}${page.path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES.static)
    .filter((page) => page.index)
    .map(getSitemapItem);
}
