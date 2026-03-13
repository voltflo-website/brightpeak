"use client";

import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../basePath";

interface Submission {
  id: string;
  date: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  read: boolean;
}

export function SubmissionsViewer({ password }: { password: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(apiUrl("/adm/submissions", password));
      if (res.status === 401) {
        setError("Unauthorized — please check your admin password.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load submissions.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      setError("Failed to connect to server.");
    }
    setLoading(false);
  }, [password]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch(apiUrl("/adm/submissions", password), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      await loadSubmissions();
    } catch {}
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const serviceLabels: Record<string, string> = {
    "solar-residential": "Residential Solar",
    "solar-commercial": "Commercial Solar",
    "battery": "Battery Storage",
    "ev-charger": "EV Charger",
    "other": "Other",
  };

  const unreadCount = submissions.filter((s) => !s.read).length;

  if (loading) {
    return <div style={{ padding: "2rem", color: "#888" }}>Loading submissions...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>⚠️</div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "#dc2626" }}>Error</h3>
        <p style={{ color: "#888", marginBottom: "1rem" }}>{error}</p>
        <button
          onClick={() => { setLoading(true); loadSubmissions(); }}
          style={{ padding: "0.5rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", background: "#fff", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>📬</div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Submissions Yet</h3>
        <p style={{ color: "#888" }}>Contact form submissions will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ color: "#888", fontSize: "0.875rem" }}>
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          {unreadCount > 0 && <span style={{ color: "#009968", fontWeight: 600 }}> ({unreadCount} unread)</span>}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {submissions.map((sub) => {
          const isExpanded = expandedId === sub.id;
          return (
            <div
              key={sub.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                overflow: "hidden",
                background: sub.read ? "#fff" : "#f0fdf4",
                borderLeft: sub.read ? "1px solid #e2e8f0" : "4px solid #009968",
              }}
            >
              <div
                onClick={() => {
                  setExpandedId(isExpanded ? null : sub.id);
                  if (!sub.read) handleAction(sub.id, "markRead");
                }}
                style={{
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: sub.read ? 500 : 700, fontSize: "0.95rem" }}>
                    {sub.firstName} {sub.lastName}
                    {sub.service && (
                      <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "999px", background: "#e0f2fe", color: "#0369a1" }}>
                        {serviceLabels[sub.service] || sub.service}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>
                    {sub.email} &middot; {formatDate(sub.date)}
                  </div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "#888" }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "0.15rem" }}>Name</div>
                      <div style={{ fontSize: "0.9rem" }}>{sub.firstName} {sub.lastName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "0.15rem" }}>Email</div>
                      <div style={{ fontSize: "0.9rem" }}><a href={`mailto:${sub.email}`} style={{ color: "#0369a1" }}>{sub.email}</a></div>
                    </div>
                    {sub.phone && (
                      <div>
                        <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "0.15rem" }}>Phone</div>
                        <div style={{ fontSize: "0.9rem" }}><a href={`tel:${sub.phone}`} style={{ color: "#0369a1" }}>{sub.phone}</a></div>
                      </div>
                    )}
                    {sub.service && (
                      <div>
                        <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "0.15rem" }}>Service</div>
                        <div style={{ fontSize: "0.9rem" }}>{serviceLabels[sub.service] || sub.service}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "0.25rem" }}>Message</div>
                    <div style={{ fontSize: "0.9rem", lineHeight: 1.6, padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem", whiteSpace: "pre-wrap" }}>{sub.message}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <button
                      onClick={() => handleAction(sub.id, sub.read ? "markUnread" : "markRead")}
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", background: "#fff", cursor: "pointer" }}
                    >
                      {sub.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this submission?")) handleAction(sub.id, "delete");
                      }}
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", border: "1px solid #fecaca", borderRadius: "0.375rem", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
