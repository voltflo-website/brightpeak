const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "a", "span",
  "blockquote",
]);

const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:|\/|#)/i;

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
};

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*\S+/gi, "");

  clean = clean.replace(/<(\/?)(\w+)([^>]*)>/g, (_match, slash: string, tag: string, attrs: string) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";
    if (slash) return `</${lower}>`;
    const allowed = ALLOWED_ATTRS[lower];
    if (!allowed) return `<${lower}>`;
    const cleanAttrs = (attrs || "").match(/\w[\w-]*\s*=\s*"[^"]*"/g) || [];
    const safe = cleanAttrs
      .filter((a) => {
        const name = a.split("=")[0].trim().toLowerCase();
        if (!allowed.has(name)) return false;
        if (name === "href") {
          const val = a.slice(a.indexOf('"') + 1, a.lastIndexOf('"'));
          if (!SAFE_PROTOCOLS.test(val.trim())) return false;
        }
        return true;
      })
      .join(" ");
    return `<${lower}${safe ? " " + safe : ""}>`;
  });

  return clean;
}
