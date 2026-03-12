import { FIELD_LABEL_OVERRIDES } from "./config";

export function formatLabel(key: string): string {
  if (FIELD_LABEL_OVERRIDES[key]) return FIELD_LABEL_OVERRIDES[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export function setNestedValue(obj: unknown, path: string, value: unknown): unknown {
  if (!path) return value;
  const keys = path.split(".");
  const result = JSON.parse(JSON.stringify(obj));
  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const numKey = Number(key);
    if (!isNaN(numKey) && Array.isArray(current)) {
      current = current[numKey] as Record<string, unknown>;
    } else {
      current = current[key] as Record<string, unknown>;
    }
  }

  const lastKey = keys[keys.length - 1];
  const numLastKey = Number(lastKey);
  if (!isNaN(numLastKey) && Array.isArray(current)) {
    (current as unknown[])[numLastKey] = value;
  } else {
    current[lastKey] = value;
  }

  return result;
}

export function blankFromTemplate(template: Record<string, unknown>): Record<string, unknown> {
  const blank: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(template)) {
    if (val === null || val === undefined) {
      blank[key] = "";
    } else if (typeof val === "string") {
      blank[key] = "";
    } else if (typeof val === "number") {
      blank[key] = 0;
    } else if (typeof val === "boolean") {
      blank[key] = val;
    } else if (Array.isArray(val)) {
      blank[key] = [];
    } else if (typeof val === "object") {
      blank[key] = blankFromTemplate(val as Record<string, unknown>);
    } else {
      blank[key] = "";
    }
  }
  return blank;
}

export interface FileData {
  file: string;
  data: Record<string, unknown>;
}

export function syncCustomPageSections(files: FileData[]): FileData[] {
  const customPagesFile = files.find((f) => f.file === "pages/CustomPages.json");
  const homePageFile = files.find((f) => f.file === "HomePage.json");
  if (!customPagesFile || !homePageFile) return files;

  const pages = customPagesFile.data.pages as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(pages)) return files;

  const sections = (homePageFile.data.sections || {}) as Record<string, boolean>;
  const order = (homePageFile.data.order || []) as string[];

  const homepageSlugs = new Set<string>();
  const titleMap: Record<string, string> = {};
  for (const page of pages) {
    if (page.placement === "homepage" && page.slug && typeof page.slug === "string") {
      const key = `custom_${page.slug}`;
      homepageSlugs.add(key);
      const hero = page.hero as Record<string, unknown> | undefined;
      const title = (hero?.title as string) || "";
      if (title) titleMap[key] = title;
    }
  }

  const existingCustomKeys = Object.keys(sections).filter((k) => k.startsWith("custom_"));
  let changed = false;
  let customPagesChanged = false;

  const newSections = { ...sections };
  const newOrder = [...order];

  for (const key of homepageSlugs) {
    if (!(key in newSections)) {
      newSections[key] = true;
      changed = true;
    }
    if (!newOrder.includes(key)) {
      newOrder.push(key);
      changed = true;
    }
  }

  for (const key of existingCustomKeys) {
    if (!homepageSlugs.has(key)) {
      delete newSections[key];
      const idx = newOrder.indexOf(key);
      if (idx !== -1) newOrder.splice(idx, 1);
      changed = true;
    }
  }

  const updatedPages = pages.map((page) => {
    if (page.placement !== "homepage" || !page.slug) return page;
    const key = `custom_${page.slug}`;
    const sectionEnabled = newSections[key] !== false;
    if (page.enabled !== sectionEnabled) {
      customPagesChanged = true;
      return { ...page, enabled: sectionEnabled };
    }
    return page;
  });

  const oldTitles = homePageFile.data._customTitles as Record<string, string> | undefined;
  const titlesChanged = JSON.stringify(oldTitles || {}) !== JSON.stringify(titleMap);

  if (!changed && !titlesChanged && !customPagesChanged) return files;

  return files.map((f) => {
    if (f.file === "HomePage.json") {
      return { ...f, data: { ...f.data, sections: newSections, order: newOrder, _customTitles: titleMap } };
    }
    if (f.file === "pages/CustomPages.json" && customPagesChanged) {
      return { ...f, data: { ...f.data, pages: updatedPages } };
    }
    return f;
  });
}
