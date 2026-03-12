import fs from "fs";
import path from "path";

const DATA_BASE = path.join(process.cwd(), "data");

export function loadHomeData<T = Record<string, unknown>>(fileName: string): T {
  const filePath = path.join(DATA_BASE, "home", fileName);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function loadPageData<T = Record<string, unknown>>(fileName: string): T {
  const filePath = path.join(DATA_BASE, "pages", fileName);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function loadData<T = Record<string, unknown>>(relativePath: string): T {
  const filePath = path.join(DATA_BASE, relativePath);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}
