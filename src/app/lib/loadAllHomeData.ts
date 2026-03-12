import fs from "fs";
import path from "path";
import { loadCustomPages } from "./customPages";

const DATA_BASE = path.join(process.cwd(), "data");

function readJson(filePath: string): Record<string, unknown> {
  try {
    const content = fs.readFileSync(path.join(DATA_BASE, filePath), "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export function loadAllHomeData() {
  const disabled = loadDisabledPages();
  return {
    homePage: readJson("home/HomePage.json"),
    hero: readJson("home/HeroSection.json"),
    serviceCards: readJson("home/ServiceCardsSection.json"),
    trustBar: readJson("home/TrustBarSection.json"),
    video: readJson("home/VideoSection.json"),
    whyChoose: readJson("home/WhyChooseSection.json"),
    impact: readJson("home/ImpactSection.json"),
    caseStudies: readJson("home/CaseStudiesSection.json"),
    how: readJson("home/HowSection.json"),
    testimonials: readJson("home/TestimonialsSection.json"),
    faq: readJson("home/FaqSection.json"),
    accreditations: readJson("home/AccreditationsSection.json"),
    newsVideos: readJson("home/NewsVideosSection.json"),
    finalCta: readJson("home/FinalCtaSection.json"),
    testimonialsPage: readJson("pages/TestimonialsPage.json"),
    navigation: filterDisabledLinks(readJson("home/Navigation.json"), disabled),
    footer: filterDisabledLinks(readJson("home/Footer.json"), disabled),
    headerSettings: readJson("home/HeaderSettings.json"),
    siteSettings: readJson("home/SiteSettings.json"),
    companySettings: readJson("home/CompanySettings.json"),
    heroCta: loadHeroCta(),
    customPages: loadCustomPages(),
  };
}

export type HomeData = ReturnType<typeof loadAllHomeData>;

export function loadPageJson(fileName: string): Record<string, unknown> {
  return readJson(`pages/${fileName}`);
}

export function loadHeroCta(): { label: string; href: string } {
  const hero = readJson("home/HeroSection.json");
  const cta = (hero.cta as any[])?.[0];
  return { label: cta?.label || "Get a Free Quote", href: cta?.href || "/contact" };
}

function loadDisabledPages(): Set<string> {
  const disabled = new Set<string>();
  const pagesDir = path.join(DATA_BASE, "pages");
  try {
    const files = fs.readdirSync(pagesDir).filter((f: string) => f.endsWith("Page.json"));
    for (const file of files) {
      const data = readJson(`pages/${file}`);
      if (data.enabled === false) {
        const slug = file
          .replace("Page.json", "")
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "");
        disabled.add(`/${slug}`);
      }
    }
  } catch {}
  return disabled;
}

function filterDisabledLinks(data: Record<string, unknown>, disabled: Set<string>): Record<string, unknown> {
  if (disabled.size === 0) return data;
  const filtered = { ...data };
  if (Array.isArray(filtered.links)) {
    filtered.links = (filtered.links as any[])
      .map((link: any) => {
        if (link.type === "dropdown" && Array.isArray(link.children)) {
          const children = link.children.filter((c: any) => !disabled.has(c.href));
          if (children.length === 0) return null;
          return { ...link, children };
        }
        return disabled.has(link.href) ? null : link;
      })
      .filter(Boolean);
  }
  if (Array.isArray(filtered.utilityLinks)) {
    filtered.utilityLinks = (filtered.utilityLinks as any[]).filter((l: any) => !disabled.has(l.href));
  }
  if (Array.isArray(filtered.columns)) {
    filtered.columns = (filtered.columns as any[]).map((col: any) => {
      if (!Array.isArray(col.links)) return col;
      return { ...col, links: col.links.filter((l: any) => !disabled.has(l.href)) };
    }).filter((col: any) => !Array.isArray(col.links) || col.links.length > 0);
  }
  return filtered;
}

export function loadNavFooterData() {
  const disabled = loadDisabledPages();
  const navRaw = readJson("home/Navigation.json");
  return {
    navigation: filterDisabledLinks(navRaw, disabled),
    footer: filterDisabledLinks(readJson("home/Footer.json"), disabled),
    headerSettings: readJson("home/HeaderSettings.json"),
    siteSettings: readJson("home/SiteSettings.json"),
    companySettings: readJson("home/CompanySettings.json"),
    heroCta: loadHeroCta(),
  };
}
