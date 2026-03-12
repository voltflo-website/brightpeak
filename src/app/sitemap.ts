import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

function loadJson(filePath: string): any {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const seoData = loadJson("data/seo.json");
  const baseUrl = seoData.siteUrl || "";
  const now = new Date();

  const pages = Object.keys(seoData.pages || {});

  const entries: MetadataRoute.Sitemap = pages.map((p) => {
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "monthly";
    let priority = 0.7;

    if (p === "/") {
      changeFrequency = "weekly";
      priority = 1.0;
    } else if (["/solar-panels", "/battery-storage", "/ev-chargers", "/commercial-solar"].includes(p)) {
      changeFrequency = "weekly";
      priority = 0.9;
    } else if (["/our-work", "/news", "/services", "/locations"].includes(p)) {
      changeFrequency = "weekly";
      priority = 0.8;
    } else if (["/solar-guide", "/grants", "/finance", "/funding-options", "/contact"].includes(p)) {
      changeFrequency = "monthly";
      priority = 0.8;
    } else if (["/privacy-policy", "/cookies"].includes(p)) {
      changeFrequency = "yearly";
      priority = 0.3;
    }

    return {
      url: `${baseUrl}${p === "/" ? "" : p}`,
      lastModified: now,
      changeFrequency,
      priority,
    };
  });

  const caseStudies = loadJson("data/home/CaseStudiesSection.json");
  if (caseStudies.cards) {
    for (const card of caseStudies.cards) {
      if (card.slug) {
        entries.push({
          url: `${baseUrl}/our-work/${card.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  const newsData = loadJson("data/home/NewsVideosSection.json");
  if (newsData.newsItems) {
    for (const item of newsData.newsItems) {
      if (item.slug) {
        entries.push({
          url: `${baseUrl}/news/${item.slug}`,
          lastModified: item.date ? new Date(item.date) : now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  const faqData = loadJson("data/home/FaqSection.json");
  if (faqData.categories) {
    for (const cat of faqData.categories) {
      if (cat.slug) {
        entries.push({
          url: `${baseUrl}/solar-guide/${cat.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  const locationsData = loadJson("data/home/LocationsSection.json");
  if (locationsData.locations) {
    for (const loc of locationsData.locations) {
      if (loc.slug) {
        entries.push({
          url: `${baseUrl}/locations/${loc.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
