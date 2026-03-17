import fs from "fs";
import path from "path";

interface RedirectEntry {
  legacy: string;
  new: string;
}

let cache: RedirectEntry[] | null = null;
let cacheTime = 0;
const TTL = 10_000;

function loadRedirects(): RedirectEntry[] {
  const now = Date.now();
  if (cache && now - cacheTime < TTL) return cache;
  try {
    const filePath = path.join(process.cwd(), "data", "redirects.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      cache = Array.isArray(parsed) ? parsed : [];
    } else {
      cache = [];
    }
  } catch {
    cache = [];
  }
  cacheTime = now;
  return cache!;
}

function normalize(p: string): string {
  let cleaned = p.trim().toLowerCase().replace(/\/+$/, "");
  if (!cleaned.startsWith("/")) cleaned = "/" + cleaned;
  return cleaned;
}

export function checkRedirect(pathname: string): string | null {
  const redirects = loadRedirects();
  const normalizedPath = normalize(pathname);

  for (const entry of redirects) {
    if (entry.legacy && entry.new) {
      if (normalize(entry.legacy) === normalizedPath) {
        let target = entry.new.trim();
        if (!target.startsWith("http://") && !target.startsWith("https://") && !target.startsWith("/")) {
          target = "/" + target;
        }
        return target;
      }
    }
  }

  return null;
}
