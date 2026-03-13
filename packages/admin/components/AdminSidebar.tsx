"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SECTION_LABELS, SECTION_ORDER, SECTION_GROUPS } from "../config";
import { apiUrl } from "../basePath";
import { setNestedValue, syncCustomPageSections } from "../utils";
import type { FileData } from "../utils";
import { SmartEditorSidebar } from "./SmartEditorSidebar";
import { SubmissionsViewer } from "./SubmissionsViewer";

export default function AdminSidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFile, setActiveFile] = useState("HeroSection.json");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [modified, setModified] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: "success" | "error"; message: string; url?: string } | null>(null);

  const getPass = useCallback((pw?: string) => pw ?? passwordInput, [passwordInput]);

  const getHeaders = useCallback(() => {
    return { "Content-Type": "application/json" };
  }, []);

  const loadData = useCallback(async (pw?: string) => {
    setLoading(true);
    const pass = getPass(pw);
    try {
      const res = await fetch(apiUrl("/adm/data", pass), { headers: getHeaders() });
      if (res.status === 401) {
        setAuthenticated(false);
        setAuthError("Invalid password");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setFiles(syncCustomPageSections(json.files));
      setAuthenticated(true);
      setAuthError("");
    } catch {
      setAuthError("Failed to load data");
    }
    setLoading(false);
  }, [getHeaders]);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("admin_password");
    if (stored) setPasswordInput(stored);
    const wasOpen = sessionStorage.getItem("admin_sidebar_open");
    const storedFile = sessionStorage.getItem("admin_sidebar_file");
    if (wasOpen === "true") {
      setOpen(true);
      if (storedFile) setActiveFile(storedFile);
      if (stored) loadData(stored);
    }
  }, []);

  useEffect(() => {
    if (open) {
      sessionStorage.setItem("admin_sidebar_open", "true");
    } else {
      sessionStorage.removeItem("admin_sidebar_open");
    }
  }, [open]);

  useEffect(() => {
    sessionStorage.setItem("admin_sidebar_file", activeFile);
  }, [activeFile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setAuthError("Please enter a password");
      return;
    }
    setPasswordInput(trimmed);
    setLoading(true);
    try {
      const loginRes = await fetch(apiUrl("/adm/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: trimmed }),
      });
      if (loginRes.status === 401) {
        setAuthError("Invalid password");
        setLoading(false);
        return;
      }
      if (!loginRes.ok) {
        const d = await loginRes.json().catch(() => ({}));
        setAuthError((d as Record<string, string>).error || "Login failed");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("admin_password", trimmed);
      await loadData(trimmed);
    } catch (err: unknown) {
      setAuthError("Connection error: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const handleFieldChange = useCallback((filePath: string, fieldPath: string, value: unknown) => {
    setFiles((prev) => {
      let updated = prev.map((f) => {
        if (f.file !== filePath) return f;
        const newData = setNestedValue(f.data, fieldPath, value);
        return { ...f, data: newData as Record<string, unknown> };
      });
      if (filePath === "pages/CustomPages.json" || filePath === "HomePage.json") {
        const beforeHome = prev.find((f) => f.file === "HomePage.json");
        const beforeCustom = prev.find((f) => f.file === "pages/CustomPages.json");
        updated = syncCustomPageSections(updated);
        const afterHome = updated.find((f) => f.file === "HomePage.json");
        const afterCustom = updated.find((f) => f.file === "pages/CustomPages.json");
        if (beforeHome && afterHome && beforeHome !== afterHome) {
          setTimeout(() => setModified((p) => new Set([...p, "HomePage.json"])), 0);
        }
        if (beforeCustom && afterCustom && beforeCustom !== afterCustom) {
          setTimeout(() => setModified((p) => new Set([...p, "pages/CustomPages.json"])), 0);
        }
      }
      return updated;
    });
    setModified((prev) => new Set([...prev, filePath]));
    setSaveStatus("");
  }, []);

  const handleSave = async (fileName: string) => {
    setSaving(true);
    setSaveStatus("");
    const fileData = files.find((f) => f.file === fileName);
    if (!fileData) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(apiUrl("/adm/data", passwordInput), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ file: fileName, data: fileData.data }),
      });

      if (res.ok) {
        setSaveStatus("Saved!");
        setModified((prev) => {
          const next = new Set(prev);
          next.delete(fileName);
          return next;
        });
        router.refresh();
      } else {
        setSaveStatus("Error saving");
      }
    } catch {
      setSaveStatus("Error saving");
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (modified.size > 0) {
      setPublishStatus({ type: "error", message: "Save all changes first" });
      return;
    }
    setPublishing(true);
    setPublishStatus(null);
    try {
      const res = await fetch(apiUrl("/adm/publish", passwordInput), { method: "POST", headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.filesCount === 0) {
          setPublishStatus({ type: "success", message: "No changes to submit — everything is up to date" });
        } else {
          setPublishStatus({ type: "success", message: `Submitted ${data.filesCount} changed file(s) for review`, url: data.url });
        }
      } else {
        setPublishStatus({ type: "error", message: data.error || "Submit failed" });
      }
    } catch {
      setPublishStatus({ type: "error", message: "Submit failed" });
    }
    setPublishing(false);
  };

  const activeData = files.find((f) => f.file === activeFile);

  if (!mounted) return null;

  return (
    <>
      <button
        className="sb-toggle-btn"
        onClick={() => {
          setOpen(!open);
          if (!open && !authenticated) {
            const stored = sessionStorage.getItem("admin_password");
            if (stored) {
              setPasswordInput(stored);
            }
          }
        }}
        title={open ? "Close editor" : "Open editor"}
      >
        {open ? "✕" : "✎"}
      </button>

      {open && (
        <div className="sb-overlay" onClick={() => setOpen(false)} />
      )}

      <div className={`sb-panel ${open ? "sb-panel-open" : ""}`}>
        {!authenticated ? (
          <div className="sb-auth">
            <h3 className="sb-auth-title">Admin Login</h3>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                className="sb-input"
                autoFocus
              />
              {authError && <p className="sb-error">{authError}</p>}
              <button type="submit" className="sb-btn-login">
                Sign In
              </button>
            </form>
          </div>
        ) : loading ? (
          <div className="sb-auth">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="sb-header">
              <div className="sb-dropdown-wrap">
                <button
                  type="button"
                  className="sb-select"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>{activeFile === "__submissions__" ? "Contact Submissions" : SECTION_LABELS[activeFile]}{modified.has(activeFile) ? " *" : ""}</span>
                  <span className="sb-select-arrow">{dropdownOpen ? "▴" : "▾"}</span>
                </button>
                {dropdownOpen && (
                  <div className="sb-dropdown-menu">
                    {SECTION_GROUPS.map((group) => (
                      <div key={group.label} className="sb-dropdown-group">
                        <div className="sb-dropdown-group-label">{group.label}</div>
                        {group.files.map((f) => {
                          const fileData = files.find((fd) => fd.file === f);
                          const isPageDisabled = fileData?.data?.enabled === false;
                          return (
                          <button
                            key={f}
                            type="button"
                            className={`sb-dropdown-item${activeFile === f ? " active" : ""}${modified.has(f) ? " modified" : ""}`}
                            onClick={() => { setActiveFile(f); setDropdownOpen(false); }}
                            style={isPageDisabled ? { opacity: 0.45 } : undefined}
                          >
                            {SECTION_LABELS[f]}{modified.has(f) ? " *" : ""}
                          </button>
                          );
                        })}
                      </div>
                    ))}
                    <div className="sb-dropdown-group">
                      <div className="sb-dropdown-group-label">Inbox</div>
                      <button
                        type="button"
                        className={`sb-dropdown-item${activeFile === "__submissions__" ? " active" : ""}`}
                        onClick={() => { setActiveFile("__submissions__"); setDropdownOpen(false); }}
                      >
                        Contact Submissions
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {activeFile !== "__submissions__" && (
                <div className="sb-header-actions">
                  <div className="sb-actions-left">
                    <button
                      onClick={() => {
                        setModified(new Set());
                        loadData();
                      }}
                      disabled={loading}
                      className="sb-btn-refresh"
                      title="Refresh data"
                    >
                      {loading ? "..." : "↻"}
                    </button>
                    <button
                      onClick={() => handleSave(activeFile)}
                      disabled={saving || !modified.has(activeFile)}
                      className="sb-btn-save"
                    >
                      {saving ? "..." : "Save"}
                    </button>
                    {saveStatus && (
                      <span className={`sb-status ${saveStatus.includes("Error") ? "sb-status-err" : "sb-status-ok"}`}>
                        {saveStatus}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handlePublish}
                    disabled={publishing || modified.size > 0}
                    className="sb-btn-submit"
                    title={modified.size > 0 ? "Save all changes first" : "Submit changes for review"}
                  >
                    {publishing ? "..." : "Submit for Review"}
                  </button>
                </div>
              )}
              {publishStatus && (
                <div className={`sb-publish-status ${publishStatus.type === "success" ? "sb-publish-ok" : "sb-publish-err"}`}>
                  <span>{publishStatus.message}</span>
                  {publishStatus.url && (
                    <a href={publishStatus.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
                  )}
                </div>
              )}
            </div>

            <div className="sb-body">
              {activeFile === "__submissions__" ? (
                <SubmissionsViewer password={passwordInput} />
              ) : activeData ? (
                <SmartEditorSidebar
                  key={activeFile}
                  data={activeData.data}
                  onChange={(fieldPath, value) =>
                    handleFieldChange(activeFile, fieldPath, value)
                  }
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
}
