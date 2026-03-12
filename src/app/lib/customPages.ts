import fs from "fs";
import path from "path";

export interface CustomPage {
  enabled: boolean;
  slug: string;
  type: "section" | "iframe" | "image";
  placement: "page" | "homepage";
  iframeUrl: string;
  imageUrl: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    bannerImage: string;
  };
  content: {
    eyebrow: string;
    title: string;
    cards: {
      subHeading: string;
      paragraph: string;
      image: string;
    }[];
  };
}

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase().trim();
}

function isValidPage(p: unknown): p is CustomPage {
  if (typeof p !== "object" || p === null) return false;
  const obj = p as Record<string, unknown>;
  if (typeof obj.enabled !== "boolean") return false;
  if (typeof obj.slug !== "string" || !obj.slug) return false;
  return true;
}

export function loadCustomPages(): CustomPage[] {
  try {
    const filePath = path.join(process.cwd(), "data", "pages", "CustomPages.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.pages)) return [];
    return data.pages
      .filter(isValidPage)
      .map((p: any) => ({
        enabled: p.enabled,
        slug: normalizeSlug(p.slug),
        type: p.type === "iframe" ? "iframe" : p.type === "image" ? "image" : "section",
        placement: p.placement === "homepage" ? "homepage" : "page",
        iframeUrl: p.iframeUrl || "",
        imageUrl: p.imageUrl || "",
        hero: {
          eyebrow: p.hero?.eyebrow || "",
          title: p.hero?.title || "",
          subtitle: p.hero?.subtitle || "",
          bannerImage: p.hero?.bannerImage || "",
        },
        content: {
          eyebrow: p.content?.eyebrow || "",
          title: p.content?.title || "",
          cards: Array.isArray(p.content?.cards) ? p.content.cards : [],
        },
      }));
  } catch {
    return [];
  }
}
