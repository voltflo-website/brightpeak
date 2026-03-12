import fs from "fs";
import path from "path";
import { VALID_FILES } from "./config";

const DEFAULTS_DIR = path.join(__dirname, "defaults");

function deepMergeDefaults(existing: unknown, defaults: unknown): unknown {
  if (defaults === null || defaults === undefined) return existing;
  if (existing === null || existing === undefined) return defaults;

  if (Array.isArray(defaults)) {
    if (Array.isArray(existing)) return existing;
    return defaults;
  }

  if (typeof defaults === "object" && typeof existing === "object" && !Array.isArray(existing)) {
    const result = { ...(existing as Record<string, unknown>) };
    const def = defaults as Record<string, unknown>;
    for (const key of Object.keys(def)) {
      if (!(key in result)) {
        result[key] = def[key];
      } else if (
        typeof def[key] === "object" &&
        def[key] !== null &&
        !Array.isArray(def[key]) &&
        typeof result[key] === "object" &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMergeDefaults(result[key], def[key]);
      }
    }
    return result;
  }

  return existing;
}

function getDefaultForFile(validFilePath: string): unknown | null {
  let defaultPath: string;

  if (validFilePath.startsWith("home/")) {
    defaultPath = path.join(DEFAULTS_DIR, validFilePath.replace("home/", "home/"));
  } else if (validFilePath.startsWith("pages/")) {
    defaultPath = path.join(DEFAULTS_DIR, validFilePath);
  } else {
    defaultPath = path.join(DEFAULTS_DIR, validFilePath);
  }

  try {
    if (fs.existsSync(defaultPath)) {
      const content = fs.readFileSync(defaultPath, "utf-8");
      return JSON.parse(content);
    }
  } catch {}

  return null;
}

export function ensureDataFiles(dataBaseDir: string): void {
  for (const validFile of VALID_FILES) {
    const filePath = path.join(dataBaseDir, validFile);
    const defaults = getDefaultForFile(validFile);

    if (!defaults) continue;

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaults, null, 2) + "\n");
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const existing = JSON.parse(content);
      const merged = deepMergeDefaults(existing, defaults);
      const existingStr = JSON.stringify(existing, null, 2);
      const mergedStr = JSON.stringify(merged, null, 2);
      if (existingStr !== mergedStr) {
        fs.writeFileSync(filePath, mergedStr + "\n");
      }
    } catch {}
  }
}

export { deepMergeDefaults, getDefaultForFile };
