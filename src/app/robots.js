import { absoluteUrl, SITE_URL } from "../lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/support", "/og-image-v2.png"],
        disallow: ["/workspace", "/calendar", "/integrations", "/billing"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
