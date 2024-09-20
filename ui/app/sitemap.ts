import type { MetadataRoute } from "next";

import { getSitemap } from "@/utils/routes.utils";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemap();
}
