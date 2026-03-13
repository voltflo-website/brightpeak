let cached: string | undefined;

export function getBasePath(): string {
  if (cached !== undefined) return cached;
  if (typeof window !== "undefined" && (window as any).__NEXT_DATA__?.basePath) {
    cached = (window as any).__NEXT_DATA__.basePath;
  } else {
    cached = "";
  }
  return cached;
}

export function apiUrl(path: string, pw?: string): string {
  const base = `${getBasePath()}${path}`;
  if (!pw) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}pw=${encodeURIComponent(pw)}`;
}
