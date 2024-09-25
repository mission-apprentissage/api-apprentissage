import type { MetadataRoute } from "next";

import { publicConfig } from "./config.public";

const getRules = () => {
  const { env } = publicConfig;
  switch (env) {
    case "production":
      return {
        userAgent: "*",
      };
    default:
      return {
        userAgent: "*",
        disallow: "/",
      };
  }
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: getRules(),
    sitemap: `${publicConfig.baseUrl}/sitemap.xml`,
  };
}
