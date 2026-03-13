"use client";

import { useState, useEffect, useCallback } from "react";
import { SECTION_LABELS, SECTION_ORDER, SECTION_GROUPS } from "../config";
import { setNestedValue, formatLabel, syncCustomPageSections } from "../utils";
import { apiUrl } from "../basePath";
import type { FileData } from "../utils";
import { SmartEditorPage } from "./SmartEditorPage";
import { SubmissionsViewer } from "./SubmissionsViewer";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFile, setActiveFile] = useState<string>("HomePage.json");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [modified, setModified] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: "success" | "error"; message: string; url?: string } | null>(null);

  const loadData = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/adm/data", pw), {
        headers: { "Content-Type": "application/json" },
      });
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
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("admin_password");
    if (stored) {
      setPasswordInput(stored);
      loadData(stored);
    }
  }, [loadData]);

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
    if (!fileData) return;

    try {
      const res = await fetch(apiUrl("/adm/data", passwordInput), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: fileName, data: fileData.data }),
      });

      if (res.ok) {
        setSaveStatus(`${SECTION_LABELS[fileName] || formatLabel(fileName)} saved successfully`);
        setModified((prev) => {
          const next = new Set(prev);
          next.delete(fileName);
          return next;
        });
      } else {
        setSaveStatus("Error saving changes");
      }
    } catch {
      setSaveStatus("Error saving changes");
    }
    setSaving(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const modifiedFiles = files.filter((f) => modified.has(f.file));
    let allOk = true;

    for (const fileData of modifiedFiles) {
      try {
        const res = await fetch(apiUrl("/adm/data", passwordInput), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: fileData.file, data: fileData.data }),
        });
        if (!res.ok) allOk = false;
      } catch {
        allOk = false;
      }
    }

    if (allOk) {
      setSaveStatus(`All ${modifiedFiles.length} section(s) saved`);
      setModified(new Set());
    } else {
      setSaveStatus("Some sections failed to save");
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (modified.size > 0) {
      setPublishStatus({ type: "error", message: "Please save all changes before submitting for review." });
      return;
    }
    setPublishing(true);
    setPublishStatus(null);
    try {
      const res = await fetch(apiUrl("/adm/publish", passwordInput), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.filesCount === 0) {
          setPublishStatus({
            type: "success",
            message: "No changes to submit — everything is up to date",
          });
        } else {
          setPublishStatus({
            type: "success",
            message: `Submitted ${data.filesCount} changed file(s) for review`,
            url: data.url,
          });
        }
      } else {
        setPublishStatus({ type: "error", message: data.error || "Submit failed" });
      }
    } catch {
      setPublishStatus({ type: "error", message: "Submit failed — check your connection" });
    }
    setPublishing(false);
  };

  const activeData = files.find((f) => f.file === activeFile);

  const filteredGroups = SECTION_GROUPS.map((group) => ({
    ...group,
    files: group.files.filter((f) =>
      SECTION_LABELS[f]?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.files.length > 0);

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

  if (!mounted || (loading && !authenticated)) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <h2>Admin Login</h2>
          <p style={{ color: "#888", textAlign: "center" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="admin-search-input"
              autoFocus
            />
            {authError && <p style={{ color: "#e53e3e", marginTop: "0.5rem", fontSize: "0.875rem" }}>{authError}</p>}
            <button type="submit" disabled={loading} style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: "#009968", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "1rem", width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <a href="/" className="admin-back-link">View Site</a>
        </div>
        <div className="admin-sidebar-search">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <nav className="admin-nav">
          {filteredGroups.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <div className="admin-nav-group-label">{group.label}</div>
              {group.files.map((file) => {
                const fileData = files.find((fd) => fd.file === file);
                const isPageDisabled = fileData?.data?.enabled === false;
                return (
                <button
                  key={file}
                  onClick={() => setActiveFile(file)}
                  className={`admin-nav-item ${activeFile === file ? "active" : ""} ${modified.has(file) ? "modified" : ""}`}
                  style={isPageDisabled ? { opacity: 0.45 } : undefined}
                >
                  <span>{SECTION_LABELS[file]}</span>
                  {modified.has(file) && <span className="admin-modified-dot" />}
                </button>
                );
              })}
            </div>
          ))}
          <div className="admin-nav-group">
            <div className="admin-nav-group-label">Inbox</div>
            <button
              onClick={() => setActiveFile("__submissions__")}
              className={`admin-nav-item ${activeFile === "__submissions__" ? "active" : ""}`}
            >
              <span>Contact Submissions</span>
            </button>
          </div>
        </nav>
        <div className="admin-sidebar-footer">
          {modified.size > 0 && (
            <button onClick={handleSaveAll} disabled={saving} className="admin-btn-save-all">
              {saving ? "Saving..." : `Save All (${modified.size})`}
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || modified.size > 0}
            className="admin-btn-publish"
            title={modified.size > 0 ? "Save all changes first" : "Submit content changes for review"}
          >
            {publishing ? "Submitting..." : "Submit for Review"}
          </button>
          {publishStatus && (
            <div className={`admin-publish-status ${publishStatus.type}`}>
              <span>{publishStatus.message}</span>
              {publishStatus.url && (
                <a href={publishStatus.url} target="_blank" rel="noopener noreferrer" className="admin-publish-link">
                  View on GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-toolbar">
          <div>
            <h1 className="admin-page-title">{activeFile === "__submissions__" ? "Contact Submissions" : SECTION_LABELS[activeFile]}</h1>
            {activeFile !== "__submissions__" && (
              <p className="admin-file-path">data/{activeFile.startsWith("pages/") ? activeFile : `home/${activeFile}`}</p>
            )}
          </div>
          {activeFile !== "__submissions__" && (
            <div className="admin-toolbar-actions">
              {saveStatus && (
                <span className={`admin-save-status ${saveStatus.includes("Error") ? "error" : "success"}`}>
                  {saveStatus}
                </span>
              )}
              <button
                onClick={() => handleSave(activeFile)}
                disabled={saving || !modified.has(activeFile)}
                className="admin-btn-save"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="admin-content">
          {activeFile === "__submissions__" ? (
            <SubmissionsViewer password={passwordInput} />
          ) : activeData ? (
            <SmartEditorPage
              key={activeFile}
              data={activeData.data}
              onChange={(fieldPath, value) => handleFieldChange(activeFile, fieldPath, value)}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
