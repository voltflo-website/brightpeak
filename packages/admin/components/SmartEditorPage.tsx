"use client";

import { FONT_OPTIONS, RICH_TEXT_PATH_PATTERNS, EMPTY_ARRAY_TEMPLATES } from "../config";
import { formatLabel, blankFromTemplate } from "../utils";
import { CombinedSectionManager } from "./SectionManager";
import RichTextEditor from "./RichTextEditor";
import { isFaqSection, FaqEditorPage } from "./FaqEditor";
import { ImageField, isImageField } from "./ImagePicker";
import "../styles/richtext.css";

const HERO_SECTIONS: { label: string; keys: string[] }[] = [
  { label: "Layout", keys: ["enabled", "heroLayout", "mobileLayout"] },
  { label: "Eyebrow", keys: ["showEyebrow", "eyebrow", "eyebrowColor"] },
  { label: "Background", keys: ["backgroundImageEnabled", "backgroundColor", "overlayOpacity", "image", "scrollLabel"] },
  { label: "Headlines", keys: ["heroAlignment", "wordWrapHeadlines", "headlineLines", "headlineFontSizes", "headlineColors"] },
  { label: "Subheading", keys: ["subheading", "subheadingColor"] },
  { label: "Call to Action", keys: ["cta", "ctaArrow"] },
  { label: "Badges & Stats", keys: ["heroBadges", "stats", "specialBadge"] },
];

const NAV_SECTIONS: { label: string; keys: string[] }[] = [
  { label: "General", keys: ["enabled", "showIcons"] },
  { label: "Logo", keys: ["logoSrc", "logoAlt", "logoPosition"] },
  { label: "Contact", keys: ["contact"] },
  { label: "Header Bar Links", keys: ["utilityLinks"] },
  { label: "Top Navigation Items", keys: ["links", "chevron", "mobileArrow"] },
  { label: "Social Links", keys: ["socialLinks"] },
];

function isHeroSection(data: unknown, path: string): boolean {
  if (path !== "") return false;
  if (typeof data !== "object" || data === null || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  return "heroLayout" in obj && "headlineLines" in obj && "eyebrow" in obj;
}

function isNavigationSection(data: unknown, path: string): boolean {
  if (path !== "") return false;
  if (typeof data !== "object" || data === null || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  return "logoSrc" in obj && "links" in obj && "utilityLinks" in obj;
}

function NavigationSectionEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const allKeys = Object.keys(data);
  const assignedKeys = new Set(NAV_SECTIONS.flatMap((s) => s.keys));
  const extraKeys = allKeys.filter((k) => !assignedKeys.has(k));

  return (
    <div className="admin-object">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="admin-field admin-field-nested">
          <label className="admin-label">{section.label}</label>
          <div className="admin-object">
            {section.keys.map((key) => {
              if (!(key in data)) return null;
              const value = data[key];
              const isNested = typeof value === "object" && value !== null && !Array.isArray(value);
              const isArray = Array.isArray(value);
              return (
                <div key={key} className={`admin-field${(isNested || isArray) ? " admin-field-nested" : ""}`}>
                  <label className="admin-label">{formatLabel(key)}</label>
                  <SmartEditorPage data={value} onChange={onChange} path={key} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {extraKeys.length > 0 && (
        <div className="admin-field admin-field-nested">
          <label className="admin-label">Other</label>
          <div className="admin-object">
            {extraKeys.map((key) => (
              <div key={key} className="admin-field">
                <label className="admin-label">{formatLabel(key)}</label>
                <SmartEditorPage data={data[key]} onChange={onChange} path={key} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HeroSectionEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const allKeys = Object.keys(data);
  const assignedKeys = new Set(HERO_SECTIONS.flatMap((s) => s.keys));
  const extraKeys = allKeys.filter((k) => !assignedKeys.has(k));

  const headlineKeysMap: Record<string, { textKey: string; desktopKey: string; mobileKey: string; colorKey: string }> = {
    "Headline 1": { textKey: "headlineLines.0", desktopKey: "headlineFontSizes.line1Desktop", mobileKey: "headlineFontSizes.line1Mobile", colorKey: "headlineColors.line1" },
    "Headline 2": { textKey: "headlineLines.1", desktopKey: "headlineFontSizes.line2Desktop", mobileKey: "headlineFontSizes.line2Mobile", colorKey: "headlineColors.line2" },
    "Headline 3": { textKey: "headlineLines.2", desktopKey: "headlineFontSizes.line3Desktop", mobileKey: "headlineFontSizes.line3Mobile", colorKey: "headlineColors.line3" },
  };

  function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
    const parts = dotPath.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (Array.isArray(current)) current = current[Number(part)];
      else if (typeof current === "object") current = (current as Record<string, unknown>)[part];
      else return undefined;
    }
    return current;
  }

  return (
    <div className="admin-object">
      {HERO_SECTIONS.map((section) => (
        <div key={section.label} className="admin-field admin-field-nested">
          <label className="admin-label">{section.label}</label>
          <div className="admin-object">
            {section.label === "Headlines" ? (
              <>
                {["heroAlignment", "wordWrapHeadlines"].map((key) => {
                  if (!(key in data)) return null;
                  return (
                    <div key={key} className="admin-field">
                      <label className="admin-label">{formatLabel(key)}</label>
                      <SmartEditorPage data={data[key]} onChange={onChange} path={key} />
                    </div>
                  );
                })}
                {Object.entries(headlineKeysMap).map(([lineLabel, keys]) => {
                  const textVal = getNestedValue(data, keys.textKey);
                  if (textVal === undefined) return null;
                  return (
                    <div key={lineLabel} className="admin-field admin-field-nested" style={{ marginTop: "0.5rem" }}>
                      <label className="admin-label">{lineLabel}</label>
                      <div className="admin-object">
                        <div className="admin-field">
                          <label className="admin-label">Text</label>
                          <SmartEditorPage data={textVal} onChange={onChange} path={keys.textKey} />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">Desktop Font Size (rem)</label>
                          <SmartEditorPage data={getNestedValue(data, keys.desktopKey)} onChange={onChange} path={keys.desktopKey} />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">Mobile Font Size (rem)</label>
                          <SmartEditorPage data={getNestedValue(data, keys.mobileKey)} onChange={onChange} path={keys.mobileKey} />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">Color</label>
                          <SmartEditorPage data={getNestedValue(data, keys.colorKey)} onChange={onChange} path={keys.colorKey} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              section.keys.map((key) => {
                if (!(key in data)) return null;
                const fieldPath = key;
                const value = data[key];
                const isNested = typeof value === "object" && value !== null && !Array.isArray(value);
                const isArray = Array.isArray(value);
                return (
                  <div key={key} className={`admin-field${(isNested || isArray) ? " admin-field-nested" : ""}`}>
                    <label className="admin-label">{formatLabel(key)}</label>
                    <SmartEditorPage data={value} onChange={onChange} path={fieldPath} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
      {extraKeys.length > 0 && (
        <div className="admin-field admin-field-nested">
          <label className="admin-label">Other</label>
          <div className="admin-object">
            {extraKeys.map((key) => (
              <div key={key} className="admin-field">
                <label className="admin-label">{formatLabel(key)}</label>
                <SmartEditorPage data={data[key]} onChange={onChange} path={key} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SmartEditorPage({
  data,
  onChange,
  path = "",
  insideArrayItem = false,
}: {
  data: unknown;
  onChange: (path: string, value: unknown) => void;
  path?: string;
  insideArrayItem?: boolean;
}) {
  if (isHeroSection(data, path)) {
    return <HeroSectionEditor data={data as Record<string, unknown>} onChange={onChange} />;
  }
  if (isNavigationSection(data, path)) {
    return <NavigationSectionEditor data={data as Record<string, unknown>} onChange={onChange} />;
  }
  if (isFaqSection(data, path)) {
    return <FaqEditorPage data={data as Record<string, unknown>} onChange={onChange} />;
  }
  if (data === null || data === undefined) {
    return (
      <input
        type="text"
        value=""
        onChange={(e) => onChange(path, e.target.value || null)}
        className="admin-input"
        placeholder="(empty)"
      />
    );
  }

  if (typeof data === "boolean") {
    return (
      <label className="admin-toggle">
        <input
          type="checkbox"
          checked={data}
          onChange={(e) => onChange(path, e.target.checked)}
        />
        <span className="admin-toggle-label">{data ? "Enabled" : "Disabled"}</span>
      </label>
    );
  }

  if (typeof data === "number") {
    return (
      <input
        type="text"
        inputMode="numeric"
        value={String(data)}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || v === "-") { onChange(path, 0); return; }
          const n = Number(v);
          if (!isNaN(n)) onChange(path, n);
        }}
        className="admin-input"
      />
    );
  }

  if (typeof data === "string") {
    if (path === "logoPosition" || path.endsWith(".logoPosition")) {
      const pos = (data || "navbar").toLowerCase();
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="radio" name={`logoPosition-${path}`} checked={pos === "header"} onChange={() => onChange(path, "header")} />
            <span>Logo in Header</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="radio" name={`logoPosition-${path}`} checked={pos === "navbar"} onChange={() => onChange(path, "navbar")} />
            <span>Logo in Navigation Bar</span>
          </label>
        </div>
      );
    }
    if (path === "heroAlignment" || path.endsWith(".heroAlignment")) {
      return (
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`heroAlignment-${path}`} checked={(data || "left") === "left"} onChange={() => onChange(path, "left")} />
            Left Aligned
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`heroAlignment-${path}`} checked={data === "center"} onChange={() => onChange(path, "center")} />
            Centered
          </label>
        </div>
      );
    }
    if (path === "heroLayout" || path.endsWith(".heroLayout")) {
      return (
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`heroLayout-${path}`} checked={(data || "fullscreen") === "fullscreen"} onChange={() => onChange(path, "fullscreen")} />
            Fullscreen
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`heroLayout-${path}`} checked={data === "split"} onChange={() => onChange(path, "split")} />
            Split
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`heroLayout-${path}`} checked={data === "diagonal"} onChange={() => onChange(path, "diagonal")} />
            Diagonal
          </label>
        </div>
      );
    }
    if (path === "mobileLayout" || path.endsWith(".mobileLayout")) {
      return (
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`mobileLayout-${path}`} checked={(data || "fullscreen") === "fullscreen"} onChange={() => onChange(path, "fullscreen")} />
            Full Screen
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`mobileLayout-${path}`} checked={data === "noimage"} onChange={() => onChange(path, "noimage")} />
            No Image
          </label>
        </div>
      );
    }
    if (/pages\.\d+\.type$/.test(path)) {
      const val = data === "iframe" ? "iframe" : data === "image" ? "image" : "section";
      if (val !== data) onChange(path, val);
      return (
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`type-${path}`} checked={val === "section"} onChange={() => onChange(path, "section")} />
            Section
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`type-${path}`} checked={val === "iframe"} onChange={() => onChange(path, "iframe")} />
            iFrame Page
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`type-${path}`} checked={val === "image"} onChange={() => onChange(path, "image")} />
            Image Page
          </label>
        </div>
      );
    }
    if (/pages\.\d+\.placement$/.test(path)) {
      const val = data === "homepage" ? "homepage" : "page";
      if (val !== data) onChange(path, val);
      return (
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`placement-${path}`} checked={val === "page"} onChange={() => onChange(path, "page")} />
            Separate Section
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input type="radio" name={`placement-${path}`} checked={val === "homepage"} onChange={() => onChange(path, "homepage")} />
            Homepage Section
          </label>
        </div>
      );
    }
    if ((path === "font" || path.endsWith(".font")) && FONT_OPTIONS.includes(data)) {
      return (
        <select
          value={data}
          onChange={(e) => onChange(path, e.target.value)}
          className="admin-input"
          style={{ fontFamily: `"${data}", sans-serif` }}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
              {f}
            </option>
          ))}
        </select>
      );
    }
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(data)) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input
            type="color"
            value={data.length === 4 ? `#${data[1]}${data[1]}${data[2]}${data[2]}${data[3]}${data[3]}` : data.slice(0, 7)}
            onChange={(e) => onChange(path, e.target.value)}
            style={{ width: "48px", height: "36px", border: "1px solid #333", borderRadius: "6px", cursor: "pointer", padding: "2px", background: "#1a1a2e" }}
          />
          <input
            type="text"
            value={data}
            onChange={(e) => onChange(path, e.target.value)}
            className="admin-input"
            style={{ flex: 1 }}
            placeholder="#000000"
          />
          <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: data, border: "2px solid #444", flexShrink: 0 }} />
        </div>
      );
    }
    const fieldKey = path.split(".").pop() || "";
    if (isImageField(fieldKey)) {
      return (
        <ImageField
          value={data}
          onChange={(val) => onChange(path, val)}
          variant="page"
        />
      );
    }
    if (RICH_TEXT_PATH_PATTERNS.some((re) => re.test(path))) {
      return (
        <RichTextEditor
          value={data}
          onChange={(html) => onChange(path, html)}
          variant="page"
        />
      );
    }
    if (data.length > 80) {
      return (
        <textarea
          value={data}
          onChange={(e) => onChange(path, e.target.value)}
          className="admin-textarea"
          rows={Math.min(8, Math.ceil(data.length / 60))}
        />
      );
    }
    return (
      <input
        type="text"
        value={data}
        onChange={(e) => onChange(path, e.target.value)}
        className="admin-input"
      />
    );
  }

  if (Array.isArray(data)) {
    const isObjectArray = data.length > 0 && typeof data[0] === "object" && data[0] !== null && !Array.isArray(data[0]);
    const useCards = isObjectArray && !insideArrayItem;

    const isCustomPages = path === "pages" || path.endsWith(".pages");

    const getItemLabel = (item: unknown, index: number): string => {
      if (!isObjectArray) return `#${index + 1}`;
      const obj = item as Record<string, unknown>;
      const hero = obj.hero as Record<string, unknown> | undefined;
      if (isCustomPages) {
        const slug = obj.slug ? `/${obj.slug}` : "";
        const title = hero?.title as string || "";
        return title || slug || `Custom Page ${index + 1}`;
      }
      const name = obj.title || obj.label || obj.name || obj.author || obj.question || (obj.slug ? `/${obj.slug}` : "") || (hero?.title ? hero.title : "") || "";
      if (name && typeof name === "string") return `${name}`;
      return `Item ${index + 1}`;
    };

    return (
      <div className="admin-array">
        {data.map((item, index) => (
          <div key={index} className={`admin-array-item${useCards ? " admin-array-item-card" : ""}${isCustomPages ? ` admin-custom-page-card admin-custom-page-type-${(item as Record<string, unknown>)?.type || "section"}` : ""}`}>
            <div className={`admin-array-header${useCards ? " admin-array-header-card" : ""}${isCustomPages ? ` admin-custom-page-header admin-custom-page-header-${(item as Record<string, unknown>)?.type || "section"}` : ""}`}>
              <span className={useCards ? "admin-array-card-title" : "admin-array-index"}>
                {useCards && <span className="admin-array-card-num">{index + 1}</span>}
                {useCards ? getItemLabel(item, index) : `#${index + 1}`}
              </span>
              <button
                onClick={() => {
                  const newArr = [...data];
                  newArr.splice(index, 1);
                  onChange(path, newArr);
                }}
                className="admin-btn-delete"
                title="Remove item"
              >
                Remove
              </button>
            </div>
            <SmartEditorPage
              data={item}
              onChange={onChange}
              path={path ? `${path}.${index}` : `${index}`}
              insideArrayItem={useCards}
            />
          </div>
        ))}
        <button
          onClick={() => {
            const fieldName = path.split(".").pop() || "";
            let newItem: unknown;
            if (data.length > 0) {
              newItem = typeof data[0] === "object"
                ? blankFromTemplate(data[0] as Record<string, unknown>)
                : "";
            } else if (EMPTY_ARRAY_TEMPLATES[fieldName]) {
              newItem = JSON.parse(JSON.stringify(EMPTY_ARRAY_TEMPLATES[fieldName]));
            } else {
              newItem = "";
            }
            onChange(path, [...data, newItem]);
          }}
          className="admin-btn-add"
        >
          + Add Item
        </button>
      </div>
    );
  }

  if (path === "contactForm") {
    const val = typeof data === "string" ? data : "/contact";
    return (
      <div className="admin-object">
        <div className="admin-field">
          <label className="admin-label">Contact Form</label>
          <input
            type="text"
            value={val}
            onChange={(e) => onChange(path, e.target.value)}
            className="admin-input"
            placeholder="/contact or https://example.com/form"
          />
        </div>
      </div>
    );
  }

  if (typeof data === "object" && !Array.isArray(data) && data !== null && /^links\.\d+$/.test(path)) {
    const item = data as Record<string, unknown>;
    const itemType = (item.type === "dropdown") ? "dropdown" : "regular";
    const children = Array.isArray(item.children) ? item.children as Record<string, unknown>[] : [];

    return (
      <div className="admin-object">
        <div className="admin-field">
          <label className="admin-label">Menu Label</label>
          <input
            type="text"
            value={(item.label as string) || ""}
            onChange={(e) => onChange(`${path}.label`, e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Type</label>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
              <input type="radio" name={`navtype-${path}`} checked={itemType === "dropdown"} onChange={() => {
                const updated = { ...item, type: "dropdown", children: Array.isArray(item.children) ? item.children : [{ label: "", href: "" }] };
                onChange(path, updated);
              }} />
              Dropdown
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
              <input type="radio" name={`navtype-${path}`} checked={itemType === "regular"} onChange={() => {
                const { type: _t, children: _c, mobileLabel: _m, ...rest } = item as any;
                const updated = { ...rest, href: item.href || "/" };
                onChange(path, updated);
              }} />
              Regular
            </label>
          </div>
        </div>

        {itemType === "regular" && (
          <div className="admin-field">
            <label className="admin-label">Link URL</label>
            <input
              type="text"
              value={(item.href as string) || ""}
              onChange={(e) => onChange(`${path}.href`, e.target.value)}
              className="admin-input"
              placeholder="/page-url"
            />
          </div>
        )}

        {itemType === "dropdown" && (
          <div className="admin-field">
            <label className="admin-label" style={{ fontWeight: 500, fontSize: "0.8rem" }}>Sub-links</label>
            <div style={{ paddingLeft: "1rem", borderLeft: "2px solid #333" }}>
              {children.map((child, ci) => (
                <div key={ci} style={{ marginBottom: "0.75rem", padding: "0.5rem 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>Sub-link #{ci + 1}</span>
                    <button
                      onClick={() => {
                        const newChildren = [...children];
                        newChildren.splice(ci, 1);
                        onChange(`${path}.children`, newChildren);
                      }}
                      className="admin-btn-delete"
                      title="Remove sub-link"
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <input
                      type="text"
                      value={(child.label as string) || ""}
                      onChange={(e) => onChange(`${path}.children.${ci}.label`, e.target.value)}
                      className="admin-input"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={(child.href as string) || ""}
                      onChange={(e) => onChange(`${path}.children.${ci}.href`, e.target.value)}
                      className="admin-input"
                      placeholder="/page-url"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => onChange(`${path}.children`, [...children, { label: "", href: "" }])}
                className="admin-btn-add"
              >
                + Add Sub-link
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (!path && obj.sections && obj.order && typeof obj.sections === "object" && Array.isArray(obj.order)) {
      return (
        <div className="admin-field">
          <label className="admin-label">Sections</label>
          <p style={{ fontSize: "0.8rem", color: "#888", margin: "0 0 8px 0" }}>Toggle sections on/off and drag to reorder</p>
          <CombinedSectionManager
            sections={obj.sections as Record<string, boolean>}
            order={obj.order as string[]}
            onChange={onChange}
            variant="page"
            customTitles={(obj._customTitles as Record<string, string>) || {}}
          />
        </div>
      );
    }
    const entries = Object.entries(obj).sort((a, b) => {
      if (a[0] === "enabled") return -1;
      if (b[0] === "enabled") return 1;
      return 0;
    });
    const hasImagesArray = Array.isArray(obj.images);
    return (
      <div className="admin-object">
        {entries.map(([key, value]) => {
          if (key === "image" && hasImagesArray) return null;
          if (key === "enabled" && obj.placement === "homepage") return null;
          if (key === "iframeUrl" && obj.type !== "iframe") return null;
          if (key === "imageUrl" && obj.type !== "image") return null;
          if (key === "content" && obj.type === "image") return null;
          if (key === "_customTitles") return null;
          const fieldPath = path ? `${path}.${key}` : key;
          const isNested = typeof value === "object" && value !== null && !Array.isArray(value);
          const isArray = Array.isArray(value);
          const isImageField = key === "images" || key === "image";
          const suppressHeadline = insideArrayItem || isImageField;
          const isTopLevelSection = !path && (isNested || isArray) && !suppressHeadline;
          return (
            <div
              key={key}
              className={`admin-field ${(isNested || isArray) && !suppressHeadline ? "admin-field-nested" : ""}${isTopLevelSection ? " admin-field-section" : ""}`}
            >
              <label className={`admin-label${isTopLevelSection ? " admin-label-section" : ""}`}>{formatLabel(key)}</label>
              <SmartEditorPage data={value} onChange={onChange} path={fieldPath} insideArrayItem={insideArrayItem} />
            </div>
          );
        })}
      </div>
    );
  }

  return <span>{String(data)}</span>;
}
