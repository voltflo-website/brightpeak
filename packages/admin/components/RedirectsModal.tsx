"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiUrl } from "../basePath";

interface Redirect {
  legacy: string;
  new: string;
}

interface RedirectsModalProps {
  password: string;
  onClose: () => void;
}

function parseCsv(text: string): Redirect[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const headerLine = lines[0].toLowerCase();
  let legacyIdx = 0;
  let newIdx = 1;

  const cols = headerLine.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
  const li = cols.findIndex((c) => c === "legacy" || c === "legacy url");
  const ni = cols.findIndex((c) => c === "new" || c === "new url");
  if (li !== -1) legacyIdx = li;
  if (ni !== -1) newIdx = ni;

  const hasHeader = li !== -1 || ni !== -1;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const results: Redirect[] = [];
  for (const line of dataLines) {
    const parts = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const legacy = parts[legacyIdx] || "";
    const newUrl = parts[newIdx] || "";
    if (legacy || newUrl) {
      results.push({ legacy, new: newUrl });
    }
  }
  return results;
}

export function RedirectsModal({ password, onClose }: RedirectsModalProps) {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRedirects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/adm/data?file=redirects.json", password));
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        setRedirects(data);
      }
    } catch {}
    setLoading(false);
  }, [password]);

  useEffect(() => {
    loadRedirects();
  }, [loadRedirects]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      const clean = redirects.filter((r) => r.legacy.trim() || r.new.trim());
      const res = await fetch(apiUrl("/adm/data", password), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: "redirects.json", data: clean }),
      });
      if (res.ok) {
        setSaveStatus("Saved");
        setRedirects(clean);
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        setSaveStatus("Error saving");
      }
    } catch {
      setSaveStatus("Error saving");
    }
    setSaving(false);
  };

  const addRow = () => {
    setRedirects([...redirects, { legacy: "", new: "" }]);
  };

  const removeRow = (index: number) => {
    setRedirects(redirects.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: "legacy" | "new", value: string) => {
    setRedirects(redirects.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        const parsed = parseCsv(text);
        if (parsed.length > 0) {
          setRedirects((prev) => [...prev, ...parsed]);
          setSaveStatus(`Imported ${parsed.length} redirect(s)`);
          setTimeout(() => setSaveStatus(""), 3000);
        } else {
          setSaveStatus("No valid rows found in CSV");
          setTimeout(() => setSaveStatus(""), 3000);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "10px", width: "90vw", maxWidth: "800px",
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #e5e7eb",
        }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111" }}>
            Migration URL Redirects
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "24px", color: "#6b7280", lineHeight: 1,
            padding: "4px 8px", borderRadius: "4px",
          }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#111")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            &#x2715;
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {loading ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>Loading...</p>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{
                      textAlign: "left", padding: "8px 12px", fontSize: "13px",
                      fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb",
                      width: "42%",
                    }}>Legacy URL</th>
                    <th style={{
                      textAlign: "left", padding: "8px 12px", fontSize: "13px",
                      fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb",
                      width: "42%",
                    }}>New URL</th>
                    <th style={{
                      padding: "8px 12px", borderBottom: "2px solid #e5e7eb",
                      width: "16%",
                    }} />
                  </tr>
                </thead>
                <tbody>
                  {redirects.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{
                        textAlign: "center", padding: "32px 12px",
                        color: "#9ca3af", fontSize: "14px",
                      }}>
                        No redirects configured. Click "Add Redirect" to create one.
                      </td>
                    </tr>
                  )}
                  {redirects.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: "6px 4px 6px 0" }}>
                        <input
                          type="text"
                          value={r.legacy}
                          onChange={(e) => updateRow(i, "legacy", e.target.value)}
                          placeholder="/old-page"
                          style={{
                            width: "100%", padding: "8px 10px", border: "1px solid #d1d5db",
                            borderRadius: "6px", fontSize: "14px", color: "#111",
                            background: "#fff", outline: "none", boxSizing: "border-box",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                        />
                      </td>
                      <td style={{ padding: "6px 4px" }}>
                        <input
                          type="text"
                          value={r.new}
                          onChange={(e) => updateRow(i, "new", e.target.value)}
                          placeholder="/new-page"
                          style={{
                            width: "100%", padding: "8px 10px", border: "1px solid #d1d5db",
                            borderRadius: "6px", fontSize: "14px", color: "#111",
                            background: "#fff", outline: "none", boxSizing: "border-box",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                        />
                      </td>
                      <td style={{ padding: "6px 0 6px 4px", textAlign: "center" }}>
                        <button onClick={() => removeRow(i)} style={{
                          background: "none", border: "1px solid #fca5a5",
                          color: "#dc2626", cursor: "pointer", borderRadius: "5px",
                          padding: "6px 12px", fontSize: "13px", fontWeight: 500,
                        }}
                          onMouseOver={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = "none"; }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button onClick={addRow} style={{
                  padding: "8px 16px", fontSize: "13px",
                  fontWeight: 500, color: "#2563eb", background: "#eff6ff",
                  border: "1px solid #bfdbfe", borderRadius: "6px", cursor: "pointer",
                }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#dbeafe")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#eff6ff")}
                >
                  + Add Redirect
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  style={{ display: "none" }}
                />
                <button onClick={() => fileInputRef.current?.click()} style={{
                  padding: "8px 16px", fontSize: "13px",
                  fontWeight: 500, color: "#374151", background: "#f9fafb",
                  border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer",
                }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#f9fafb")}
                >
                  Upload CSV
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderTop: "1px solid #e5e7eb",
        }}>
          <span style={{
            fontSize: "13px", fontWeight: 500,
            color: saveStatus === "Saved" ? "#16a34a" : saveStatus ? "#dc2626" : "transparent",
          }}>
            {saveStatus || "."}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{
              padding: "8px 20px", fontSize: "14px", fontWeight: 500,
              color: "#374151", background: "#f3f4f6", border: "1px solid #d1d5db",
              borderRadius: "6px", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "8px 20px", fontSize: "14px", fontWeight: 500,
              color: "#fff", background: saving ? "#93c5fd" : "#2563eb",
              border: "none", borderRadius: "6px", cursor: saving ? "default" : "pointer",
            }}>
              {saving ? "Saving..." : "Save Redirects"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
