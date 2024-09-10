import type { MetadataRoute } from "next";

import { publicConfig } from "@/config.public";
import type { IPage } from "@/utils/routes.utils";
import { PAGES } from "@/utils/routes.utils";

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
