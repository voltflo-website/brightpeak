"use client";

import RichTextEditor from "./RichTextEditor";
import { RICH_TEXT_PATH_PATTERNS } from "../config";
import { ImageField } from "./ImagePicker";

interface FaqCategory {
  slug: string;
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

function repositionItemByCategory(items: FaqItem[], itemIndex: number, newCategory: string): FaqItem[] {
  const updated = [...items];
  const item = { ...updated[itemIndex], category: newCategory };
  updated.splice(itemIndex, 1);
  const lastSiblingIndex = updated.reduce(
    (last, it, i) => (it.category === newCategory ? i : last),
    -1
  );
  if (lastSiblingIndex >= 0) {
    updated.splice(lastSiblingIndex + 1, 0, item);
  } else {
    updated.push(item);
  }
  return updated;
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  if (slug === "_orphan" || slug === "orphan") return "";
  return slug;
}

export function isFaqSection(data: unknown, path: string): boolean {
  if (path !== "") return false;
  if (typeof data !== "object" || data === null || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.categories) && Array.isArray(obj.items) && "eyebrow" in obj;
}

export function FaqEditorSidebar({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const categories = (data.categories || []) as FaqCategory[];
  const items = (data.items || []) as FaqItem[];

  const activeCategorySlugs = new Set(categories.map((c) => c.slug));

  const orphanItems = items.filter((item) => !activeCategorySlugs.has(item.category));
  const hasOrphans = orphanItems.length > 0;

  const handleRemoveCategory = (index: number) => {
    const cat = categories[index];
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    const newItems = items.map((item) =>
      item.category === cat.slug ? { ...item, category: "_orphan" } : item
    );
    onChange("categories", newCategories);
    setTimeout(() => onChange("items", newItems), 0);
  };

  const handleAddCategory = () => {
    const newSlug = `category-${Date.now()}`;
    const newCat: FaqCategory = { slug: newSlug, title: "New Category", description: "" };
    onChange("categories", [...categories, newCat]);
  };

  const handleCategoryTitleChange = (index: number, newTitle: string) => {
    const oldSlug = categories[index].slug;
    const newSlug = slugify(newTitle) || oldSlug;
    const slugExists = categories.some((c, i) => i !== index && c.slug === newSlug);
    const finalSlug = slugExists ? oldSlug : newSlug;

    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], title: newTitle, slug: finalSlug };
    onChange("categories", newCategories);

    if (finalSlug !== oldSlug) {
      const newItems = items.map((item) =>
        item.category === oldSlug ? { ...item, category: finalSlug } : item
      );
      setTimeout(() => onChange("items", newItems), 0);
    }
  };

  const handleAddItem = () => {
    const defaultCat = categories.length > 0 ? categories[0].slug : "_orphan";
    const newItem: FaqItem = { question: "", answer: "", category: defaultCat };
    onChange("items", [...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange("items", newItems);
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange("items", newItems);
  };

  return (
    <div className="sb-object">
      <div className="sb-field">
        <label className="sb-label">Enabled</label>
        <label className="sb-toggle">
          <input
            type="checkbox"
            checked={!!data.enabled}
            onChange={(e) => onChange("enabled", e.target.checked)}
          />
          <span className="sb-toggle-text">{data.enabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>
      <div className="sb-field">
        <label className="sb-label">Eyebrow</label>
        <input type="text" value={(data.eyebrow as string) || ""} onChange={(e) => onChange("eyebrow", e.target.value)} className="sb-input" />
      </div>
      <div className="sb-field">
        <label className="sb-label">Title</label>
        <input type="text" value={(data.title as string) || ""} onChange={(e) => onChange("title", e.target.value)} className="sb-input" />
      </div>
      <div className="sb-field">
        <label className="sb-label">Subtitle</label>
        <input type="text" value={(data.subtitle as string) || ""} onChange={(e) => onChange("subtitle", e.target.value)} className="sb-input" />
      </div>
      <div className="sb-field">
        <label className="sb-label">Banner Background Image</label>
        <ImageField
          value={(data.bannerImage as string) || ""}
          onChange={(val) => onChange("bannerImage", val)}
          variant="sidebar"
        />
      </div>
      <div className="sb-field">
        <label className="sb-label">FAQ Style</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
            <input type="radio" name="faqStyle" checked={(data.faqStyle as string) !== "list"} onChange={() => onChange("faqStyle", "portal")} />
            Solar Guide Portal
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
            <input type="radio" name="faqStyle" checked={(data.faqStyle as string) === "list"} onChange={() => onChange("faqStyle", "list")} />
            FAQ List
          </label>
        </div>
      </div>

      <div className="sb-field">
        <label className="sb-label sb-label-section">📁 Solar Guide Categories</label>
        <p style={{ fontSize: "11px", color: "#888", margin: "0 0 8px 0" }}>
          Manage categories. Removing a category orphans its questions (they won't display on the site).
        </p>
        <div className="sb-array">
          {categories.map((cat, ci) => {
            const catItemCount = items.filter((item) => item.category === cat.slug).length;
            return (
              <div key={ci} className="sb-array-item sb-array-item-card">
                <div className="sb-array-head sb-array-head-card">
                  <span className="sb-array-card-title">
                    <span className="sb-array-card-num">{ci + 1}</span>
                    {cat.title || "Untitled"}
                    <span style={{ fontSize: "10px", color: "#888", marginLeft: "6px" }}>
                      ({catItemCount} questions)
                    </span>
                  </span>
                  <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto" }}>
                    <button
                      onClick={() => {
                        if (ci === 0) return;
                        const newCats = [...categories];
                        [newCats[ci - 1], newCats[ci]] = [newCats[ci], newCats[ci - 1]];
                        onChange("categories", newCats);
                      }}
                      disabled={ci === 0}
                      className="sb-btn-reorder"
                      title="Move up"
                    >▲</button>
                    <button
                      onClick={() => {
                        if (ci === categories.length - 1) return;
                        const newCats = [...categories];
                        [newCats[ci], newCats[ci + 1]] = [newCats[ci + 1], newCats[ci]];
                        onChange("categories", newCats);
                      }}
                      disabled={ci === categories.length - 1}
                      className="sb-btn-reorder"
                      title="Move down"
                    >▼</button>
                    <button
                      onClick={() => {
                        if (!confirm(`Remove "${cat.title}"? Its ${catItemCount} question(s) will become orphaned and hidden from the site.`)) return;
                        handleRemoveCategory(ci);
                      }}
                      className="sb-btn-remove"
                    >x</button>
                  </div>
                </div>
                <div className="sb-object">
                  <div className="sb-field">
                    <label className="sb-label">Category Name</label>
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => handleCategoryTitleChange(ci, e.target.value)}
                      className="sb-input"
                    />
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">URL Slug</label>
                    <input
                      type="text"
                      value={cat.slug}
                      onChange={(e) => {
                        const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                        if (!newSlug || newSlug === "_orphan") return;
                        const oldSlug = cat.slug;
                        if (categories.some((c, i) => i !== ci && c.slug === newSlug)) return;
                        const newCats = [...categories];
                        newCats[ci] = { ...newCats[ci], slug: newSlug };
                        onChange("categories", newCats);
                        if (newSlug !== oldSlug) {
                          const newItems = items.map((item) =>
                            item.category === oldSlug ? { ...item, category: newSlug } : item
                          );
                          setTimeout(() => onChange("items", newItems), 0);
                        }
                      }}
                      className="sb-input"
                      style={{ fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Description</label>
                    <textarea
                      value={cat.description}
                      onChange={(e) => {
                        const newCats = [...categories];
                        newCats[ci] = { ...newCats[ci], description: e.target.value };
                        onChange("categories", newCats);
                      }}
                      className="sb-textarea"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={handleAddCategory} className="sb-btn-add">+ Add Category</button>
        </div>
      </div>

      <div className="sb-field">
        <label className="sb-label sb-label-section">❓ Questions ({items.filter(i => i.category !== "_orphan").length})</label>
        {hasOrphans && (
          <p style={{ fontSize: "11px", color: "#e67e22", margin: "0 0 8px 0", fontWeight: 600 }}>
            ⚠ {orphanItems.length} orphaned question(s) — assign a category or remove them.
          </p>
        )}
        <div className="sb-array">
          {items.map((item, ii) => {
            const isOrphan = item.category === "_orphan" || !activeCategorySlugs.has(item.category);
            return (
              <div
                key={ii}
                className="sb-array-item sb-array-item-card"
                style={isOrphan ? { borderLeft: "3px solid #e67e22" } : undefined}
              >
                <div className="sb-array-head sb-array-head-card">
                  <span className="sb-array-card-title">
                    <span className="sb-array-card-num">{ii + 1}</span>
                    {item.question || "New Question"}
                    {isOrphan && (
                      <span style={{ fontSize: "10px", color: "#e67e22", marginLeft: "6px", fontWeight: 700 }}>
                        ORPHAN
                      </span>
                    )}
                  </span>
                  <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto" }}>
                    <button onClick={() => handleMoveItem(ii, -1)} disabled={ii === 0} className="sb-btn-reorder" title="Move up">▲</button>
                    <button onClick={() => handleMoveItem(ii, 1)} disabled={ii === items.length - 1} className="sb-btn-reorder" title="Move down">▼</button>
                    <button onClick={() => handleRemoveItem(ii)} className="sb-btn-remove">x</button>
                  </div>
                </div>
                <div className="sb-object">
                  <div className="sb-field">
                    <label className="sb-label">Category</label>
                    <select
                      value={isOrphan ? "_orphan" : item.category}
                      onChange={(e) => {
                        onChange("items", repositionItemByCategory(items, ii, e.target.value));
                      }}
                      className="sb-input"
                      style={isOrphan ? { borderColor: "#e67e22", color: "#e67e22" } : undefined}
                    >
                      {isOrphan && <option value="_orphan">— Orphaned (not displayed) —</option>}
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Question</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[ii] = { ...newItems[ii], question: e.target.value };
                        onChange("items", newItems);
                      }}
                      className="sb-input"
                    />
                  </div>
                  <div className="sb-field">
                    <label className="sb-label">Answer</label>
                    <RichTextEditor
                      value={item.answer}
                      onChange={(html) => {
                        const newItems = [...items];
                        newItems[ii] = { ...newItems[ii], answer: html };
                        onChange("items", newItems);
                      }}
                      variant="sidebar"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={handleAddItem} className="sb-btn-add">+ Add Question</button>
        </div>
      </div>
    </div>
  );
}

export function FaqEditorPage({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const categories = (data.categories || []) as FaqCategory[];
  const items = (data.items || []) as FaqItem[];

  const activeCategorySlugs = new Set(categories.map((c) => c.slug));

  const orphanItems = items.filter((item) => !activeCategorySlugs.has(item.category));
  const hasOrphans = orphanItems.length > 0;

  const handleRemoveCategory = (index: number) => {
    const cat = categories[index];
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    const newItems = items.map((item) =>
      item.category === cat.slug ? { ...item, category: "_orphan" } : item
    );
    onChange("categories", newCategories);
    setTimeout(() => onChange("items", newItems), 0);
  };

  const handleAddCategory = () => {
    const newSlug = `category-${Date.now()}`;
    const newCat: FaqCategory = { slug: newSlug, title: "New Category", description: "" };
    onChange("categories", [...categories, newCat]);
  };

  const handleCategoryTitleChange = (index: number, newTitle: string) => {
    const oldSlug = categories[index].slug;
    const newSlug = slugify(newTitle) || oldSlug;
    const slugExists = categories.some((c, i) => i !== index && c.slug === newSlug);
    const finalSlug = slugExists ? oldSlug : newSlug;

    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], title: newTitle, slug: finalSlug };
    onChange("categories", newCategories);

    if (finalSlug !== oldSlug) {
      const newItems = items.map((item) =>
        item.category === oldSlug ? { ...item, category: finalSlug } : item
      );
      setTimeout(() => onChange("items", newItems), 0);
    }
  };

  const handleAddItem = () => {
    const defaultCat = categories.length > 0 ? categories[0].slug : "_orphan";
    const newItem: FaqItem = { question: "", answer: "", category: defaultCat };
    onChange("items", [...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange("items", newItems);
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange("items", newItems);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Enabled</label>
          <label className="sb-toggle">
            <input type="checkbox" checked={!!data.enabled} onChange={(e) => onChange("enabled", e.target.checked)} />
            <span className="sb-toggle-text">{data.enabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Eyebrow</label>
          <input type="text" value={(data.eyebrow as string) || ""} onChange={(e) => onChange("eyebrow", e.target.value)} className="ap-input" />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Title</label>
          <input type="text" value={(data.title as string) || ""} onChange={(e) => onChange("title", e.target.value)} className="ap-input" />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Subtitle</label>
          <input type="text" value={(data.subtitle as string) || ""} onChange={(e) => onChange("subtitle", e.target.value)} className="ap-input" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Banner Background Image</label>
          <ImageField
            value={(data.bannerImage as string) || ""}
            onChange={(val) => onChange("bannerImage", val)}
            variant="page"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>FAQ Style</label>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" name="faqStylePage" checked={(data.faqStyle as string) !== "list"} onChange={() => onChange("faqStyle", "portal")} />
              Solar Guide Portal
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" name="faqStylePage" checked={(data.faqStyle as string) === "list"} onChange={() => onChange("faqStyle", "list")} />
              FAQ List
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>📁 Solar Guide Categories</h3>
        <p style={{ fontSize: "13px", color: "#888", margin: "0 0 12px 0" }}>
          Manage categories. Removing a category orphans its questions (they won't display on the site).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {categories.map((cat, ci) => {
            const catItemCount = items.filter((item) => item.category === cat.slug).length;
            return (
              <div key={ci} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontWeight: 600 }}>
                    {ci + 1}. {cat.title || "Untitled"}
                    <span style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>({catItemCount} questions)</span>
                  </span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      onClick={() => {
                        if (ci === 0) return;
                        const newCats = [...categories];
                        [newCats[ci - 1], newCats[ci]] = [newCats[ci], newCats[ci - 1]];
                        onChange("categories", newCats);
                      }}
                      disabled={ci === 0}
                      style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px", cursor: ci === 0 ? "not-allowed" : "pointer", opacity: ci === 0 ? 0.4 : 1, background: "#fff" }}
                    >▲</button>
                    <button
                      onClick={() => {
                        if (ci === categories.length - 1) return;
                        const newCats = [...categories];
                        [newCats[ci], newCats[ci + 1]] = [newCats[ci + 1], newCats[ci]];
                        onChange("categories", newCats);
                      }}
                      disabled={ci === categories.length - 1}
                      style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px", cursor: ci === categories.length - 1 ? "not-allowed" : "pointer", opacity: ci === categories.length - 1 ? 0.4 : 1, background: "#fff" }}
                    >▼</button>
                    <button
                      onClick={() => {
                        if (!confirm(`Remove "${cat.title}"? Its ${catItemCount} question(s) will become orphaned and hidden.`)) return;
                        handleRemoveCategory(ci);
                      }}
                      style={{ border: "1px solid #e74c3c", borderRadius: 4, padding: "2px 8px", color: "#e74c3c", cursor: "pointer", background: "#fff" }}
                    >Remove</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>Category Name</label>
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => handleCategoryTitleChange(ci, e.target.value)}
                      className="ap-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>URL Slug</label>
                    <input
                      type="text"
                      value={cat.slug}
                      onChange={(e) => {
                        const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                        if (!newSlug || newSlug === "_orphan") return;
                        const oldSlug = cat.slug;
                        if (categories.some((c, i) => i !== ci && c.slug === newSlug)) return;
                        const newCats = [...categories];
                        newCats[ci] = { ...newCats[ci], slug: newSlug };
                        onChange("categories", newCats);
                        if (newSlug !== oldSlug) {
                          const newItems = items.map((item) =>
                            item.category === oldSlug ? { ...item, category: newSlug } : item
                          );
                          setTimeout(() => onChange("items", newItems), 0);
                        }
                      }}
                      className="ap-input"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
                  <textarea
                    value={cat.description}
                    onChange={(e) => {
                      const newCats = [...categories];
                      newCats[ci] = { ...newCats[ci], description: e.target.value };
                      onChange("categories", newCats);
                    }}
                    className="ap-input"
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            );
          })}
          <button
            onClick={handleAddCategory}
            style={{ padding: "0.5rem 1rem", border: "1px dashed #009968", borderRadius: 6, color: "#009968", background: "transparent", cursor: "pointer", fontWeight: 600 }}
          >
            + Add Category
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          ❓ Questions ({items.filter(i => i.category !== "_orphan").length})
        </h3>
        {hasOrphans && (
          <p style={{ fontSize: "13px", color: "#e67e22", margin: "0 0 12px 0", fontWeight: 600 }}>
            ⚠ {orphanItems.length} orphaned question(s) — assign a category or remove them.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item, ii) => {
            const isOrphan = item.category === "_orphan" || !activeCategorySlugs.has(item.category);
            return (
              <div
                key={ii}
                style={{
                  border: `1px solid ${isOrphan ? "#e67e22" : "#ddd"}`,
                  borderLeft: isOrphan ? "4px solid #e67e22" : "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: isOrphan ? "#fef5ee" : "#fafafa",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontWeight: 600 }}>
                    {ii + 1}. {item.question || "New Question"}
                    {isOrphan && (
                      <span style={{ fontSize: "11px", color: "#e67e22", marginLeft: "8px", fontWeight: 700 }}>ORPHAN</span>
                    )}
                  </span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button onClick={() => handleMoveItem(ii, -1)} disabled={ii === 0} style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px", cursor: ii === 0 ? "not-allowed" : "pointer", opacity: ii === 0 ? 0.4 : 1, background: "#fff" }}>▲</button>
                    <button onClick={() => handleMoveItem(ii, 1)} disabled={ii === items.length - 1} style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px", cursor: ii === items.length - 1 ? "not-allowed" : "pointer", opacity: ii === items.length - 1 ? 0.4 : 1, background: "#fff" }}>▼</button>
                    <button onClick={() => handleRemoveItem(ii)} style={{ border: "1px solid #e74c3c", borderRadius: 4, padding: "2px 8px", color: "#e74c3c", cursor: "pointer", background: "#fff" }}>Remove</button>
                  </div>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Category</label>
                  <select
                    value={isOrphan ? "_orphan" : item.category}
                    onChange={(e) => {
                      onChange("items", repositionItemByCategory(items, ii, e.target.value));
                    }}
                    className="ap-input"
                    style={isOrphan ? { borderColor: "#e67e22", color: "#e67e22" } : undefined}
                  >
                    {isOrphan && <option value="_orphan">— Orphaned (not displayed) —</option>}
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Question</label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[ii] = { ...newItems[ii], question: e.target.value };
                      onChange("items", newItems);
                    }}
                    className="ap-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Answer</label>
                  <RichTextEditor
                    value={item.answer}
                    onChange={(html) => {
                      const newItems = [...items];
                      newItems[ii] = { ...newItems[ii], answer: html };
                      onChange("items", newItems);
                    }}
                    variant="page"
                  />
                </div>
              </div>
            );
          })}
          <button
            onClick={handleAddItem}
            style={{ padding: "0.5rem 1rem", border: "1px dashed #009968", borderRadius: 6, color: "#009968", background: "transparent", cursor: "pointer", fontWeight: 600 }}
          >
            + Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
