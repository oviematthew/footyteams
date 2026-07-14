import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Shared lineup links are personal/ephemeral, not content worth indexing.
        disallow: "/view/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
