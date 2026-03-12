import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

function loadSeoData(): any {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), "data/seo.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return { siteUrl: "" };
  }
}

export default function robots(): MetadataRoute.Robots {
  const seoData = loadSeoData();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${seoData.siteUrl}/sitemap.xml`,
  };
}
