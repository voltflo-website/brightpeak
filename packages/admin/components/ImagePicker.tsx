"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiUrl } from "../basePath";

interface ImageInfo {
  path: string;
  name: string;
  folder: string;
  size: number;
}

interface ImagePickerProps {
  value: string;
  onChange: (path: string) => void;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getAdminPassword(): string {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("admin_password") || "";
  }
  return "";
}

export default function ImagePicker({ value, onChange, onClose }: ImagePickerProps) {
  const [tab, setTab] = useState<"browse" | "upload">("browse");
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("/");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ path: string; size: number; originalSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ path: string; references: string[] } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/adm/images", getAdminPassword()));
      if (res.status === 401) {
        setError("Authentication failed. Please log in to the admin panel again.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load images.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setImages(data.images || []);
      setFolders(data.folders || []);
    } catch {
      setError("Network error loading images.");
    }
    setLoading(false);
  }, []);

  const handleDelete = useCallback(async (imgPath: string, force = false) => {
    setDeleting(true);
    try {
      const res = await fetch(apiUrl("/adm/images", getAdminPassword()), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: imgPath, force }),
      });
      const data = await res.json();
      if (data.warning && !force) {
        setDeleteConfirm({ path: imgPath, references: data.references || [] });
        setDeleting(false);
        return;
      }
      if (data.success) {
        setImages((prev) => prev.filter((img) => img.path !== imgPath));
        setDeleteConfirm(null);
        if (value === imgPath) onChange("");
      } else {
        setError(data.error || "Delete failed");
      }
    } catch {
      setError("Network error deleting image.");
    }
    setDeleting(false);
  }, [value, onChange]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const filteredImages = images.filter((img) => {
    if (selectedFolder !== "all" && img.folder !== selectedFolder) return false;
    if (search && !img.name.toLowerCase().includes(search.toLowerCase()) && !img.path.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleFileSelect = (file: File) => {
    setUploadFile(file);
    setUploadResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", uploadFolder);

      const res = await fetch(apiUrl("/adm/images", getAdminPassword()), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadResult(data);
        await loadImages();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>Select Image</h3>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setTab("browse")} style={tab === "browse" ? styles.tabActive : styles.tab}>
            Browse Images
          </button>
          <button onClick={() => setTab("upload")} style={tab === "upload" ? styles.tabActive : styles.tab}>
            Upload New
          </button>
        </div>

        {tab === "browse" && (
          <div style={styles.content}>
            <div style={styles.filterBar}>
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                style={styles.folderSelect}
              >
                <option value="all">All Folders</option>
                {folders.map((f) => (
                  <option key={f} value={f}>{f === "/" ? "Root" : f}</option>
                ))}
              </select>
            </div>

            {error ? (
              <div style={{ ...styles.loadingMsg, color: "#f44336" }}>{error}</div>
            ) : loading ? (
              <div style={styles.loadingMsg}>Loading images...</div>
            ) : filteredImages.length === 0 ? (
              <div style={styles.loadingMsg}>No images found</div>
            ) : (
              <div style={styles.grid}>
                {filteredImages.map((img) => (
                  <div
                    key={img.path}
                    style={{
                      ...styles.imageCard,
                      ...(img.path === value ? styles.imageCardSelected : {}),
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={() => { onChange(img.path); onClose(); }}
                      style={styles.imageCardBtn}
                    >
                      <div style={styles.imageThumbWrap}>
                        <img src={img.path} alt={img.name} style={styles.imageThumb} loading="lazy" />
                      </div>
                      <div style={styles.imageMeta}>
                        <span style={styles.imageName}>{img.name}</span>
                        <span style={styles.imageSize}>{formatSize(img.size)}</span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(img.path); }}
                      style={styles.deleteBtn}
                      title="Delete image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "upload" && (
          <div style={styles.content}>
            <div style={styles.uploadArea}>
              <div style={styles.uploadFolderRow}>
                <label style={styles.uploadLabel}>Destination Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setShowNewFolder(true);
                    } else {
                      setUploadFolder(e.target.value);
                    }
                  }}
                  style={styles.folderSelect}
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>{f === "/" ? "Root (/images/)" : `/images/${f}/`}</option>
                  ))}
                  <option value="__new__">+ New Folder...</option>
                </select>
              </div>
              {showNewFolder && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#888", whiteSpace: "nowrap" }}>/images/</span>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase())}
                    placeholder="folder-name"
                    style={styles.searchInput}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newFolderName.trim()) {
                        const folderName = newFolderName.trim();
                        if (!folders.includes(folderName)) {
                          setFolders((prev) => [...prev, folderName].sort());
                        }
                        setUploadFolder(folderName);
                        setShowNewFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    style={styles.uploadBtn}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                    style={{ ...styles.browseBtn, padding: "8px 12px" }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div
                style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" style={styles.uploadPreviewImg} />
                ) : (
                  <div style={styles.dropZoneText}>
                    <span style={styles.dropIcon}>+</span>
                    <span>Drop an image here or click to browse</span>
                    <span style={styles.dropHint}>JPG, PNG, WebP, SVG — auto-optimized to WebP</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>

              {uploadFile && !uploadResult && (
                <div style={styles.uploadActions}>
                  <span style={styles.fileName}>{uploadFile.name} ({formatSize(uploadFile.size)})</span>
                  <button onClick={handleUpload} disabled={uploading} style={styles.uploadBtn}>
                    {uploading ? "Optimizing & Uploading..." : "Upload & Optimize"}
                  </button>
                </div>
              )}

              {uploadResult && (
                <div style={styles.uploadSuccess}>
                  <div style={styles.successText}>
                    Uploaded and optimized: <strong>{uploadResult.path}</strong>
                  </div>
                  <div style={styles.savingsText}>
                    {formatSize(uploadResult.originalSize)} → {formatSize(uploadResult.size)}
                    {uploadResult.originalSize > uploadResult.size && (
                      <span> (saved {Math.round((1 - uploadResult.size / uploadResult.originalSize) * 100)}%)</span>
                    )}
                  </div>
                  <button
                    onClick={() => { onChange(uploadResult.path); onClose(); }}
                    style={styles.useImageBtn}
                  >
                    Use This Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div style={styles.deleteOverlay}>
          <div style={styles.deleteDialog}>
            <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem" }}>Delete Image?</h3>
            {deleteConfirm.references.length > 0 ? (
              <>
                <p style={{ margin: "0 0 8px", color: "#f44336", fontWeight: 600 }}>
                  Warning: This image is used in {deleteConfirm.references.length} data file(s):
                </p>
                <ul style={{ margin: "0 0 12px", padding: "0 0 0 20px", fontSize: "0.85rem", color: "#666" }}>
                  {deleteConfirm.references.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
                <p style={{ margin: "0 0 16px", fontSize: "0.9rem", color: "#888" }}>
                  Deleting will cause broken images on those pages.
                </p>
              </>
            ) : (
              <p style={{ margin: "0 0 16px", fontSize: "0.9rem", color: "#666" }}>
                This image is not referenced anywhere on the site. Safe to delete.
              </p>
            )}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={styles.cancelDeleteBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.path, true)}
                disabled={deleting}
                style={styles.confirmDeleteBtn}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ImageField({
  value,
  onChange,
  variant = "sidebar",
}: {
  value: string;
  onChange: (val: string) => void;
  variant?: "sidebar" | "page";
}) {
  const [showPicker, setShowPicker] = useState(false);
  const inputClass = variant === "sidebar" ? "sb-input" : "ap-input";

  return (
    <>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          style={{ flex: 1 }}
          placeholder="/images/..."
        />
        <button
          onClick={() => setShowPicker(true)}
          style={styles.browseBtn}
          title="Browse images"
        >
          Browse
        </button>
      </div>
      {value && (
        <div style={{ marginTop: "6px", borderRadius: "6px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <img src={value} alt="Preview" style={{ width: "100%", height: variant === "page" ? "100px" : "70px", objectFit: "cover", display: "block" }} />
        </div>
      )}
      {showPicker && (
        <ImagePicker
          value={value}
          onChange={onChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

export function isImageField(key: string): boolean {
  const lower = key.toLowerCase();
  if (lower.includes("image") && !lower.includes("imagealt")) return true;
  if (lower.includes("logosrc") || lower === "logosrc") return true;
  if (lower === "img") return true;
  return false;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "12px",
    width: "min(900px, 92vw)",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid #e5e7eb",
    color: "#1d1d22",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#1d1d22",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
  },
  tab: {
    flex: 1,
    padding: "10px",
    background: "none",
    border: "none",
    color: "#888",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    transition: "color 0.2s",
  },
  tabActive: {
    flex: 1,
    padding: "10px",
    background: "none",
    border: "none",
    borderBottom: "2px solid #009968",
    color: "#009968",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  content: {
    flex: 1,
    overflow: "auto",
    padding: "16px",
  },
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },
  searchInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#1d1d22",
    fontSize: "0.85rem",
    outline: "none",
  },
  folderSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#1d1d22",
    fontSize: "0.85rem",
    cursor: "pointer",
    outline: "none",
  },
  loadingMsg: {
    textAlign: "center",
    padding: "2rem",
    color: "#888",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "10px",
  },
  imageCard: {
    background: "#f9fafb",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    padding: 0,
    textAlign: "left" as const,
    transition: "border-color 0.2s, transform 0.15s",
  },
  imageCardSelected: {
    borderColor: "#009968",
    boxShadow: "0 0 0 1px #009968",
  },
  imageThumbWrap: {
    width: "100%",
    height: "90px",
    overflow: "hidden",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageMeta: {
    padding: "6px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  imageName: {
    fontSize: "0.7rem",
    color: "#4b5563",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  imageSize: {
    fontSize: "0.65rem",
    color: "#666",
  },
  uploadArea: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  uploadFolderRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  uploadLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#4b5563",
    whiteSpace: "nowrap" as const,
  },
  dropZone: {
    border: "2px dashed #d1d5db",
    borderRadius: "10px",
    padding: "2rem",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    minHeight: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropZoneActive: {
    borderColor: "#009968",
    background: "rgba(0,153,104,0.05)",
  },
  dropZoneText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    color: "#888",
    fontSize: "0.9rem",
  },
  dropIcon: {
    fontSize: "2rem",
    color: "#9ca3af",
  },
  dropHint: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  uploadPreviewImg: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "8px",
    objectFit: "contain" as const,
  },
  uploadActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  fileName: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  uploadBtn: {
    padding: "8px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#009968",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  uploadSuccess: {
    background: "rgba(76,175,80,0.1)",
    border: "1px solid rgba(76,175,80,0.3)",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  successText: {
    fontSize: "0.85rem",
    color: "#81c784",
  },
  savingsText: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  useImageBtn: {
    alignSelf: "flex-start",
    padding: "8px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#4caf50",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    marginTop: "4px",
  },
  browseBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#4b5563",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  imageCardBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
    color: "inherit",
  },
  deleteBtn: {
    position: "absolute" as const,
    top: "4px",
    right: "4px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(244,67,54,0.85)",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
    transition: "opacity 0.2s",
    lineHeight: 1,
    zIndex: 2,
  },
  deleteOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10001,
    borderRadius: "12px",
  },
  deleteDialog: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "24px",
    maxWidth: "420px",
    width: "90%",
    border: "1px solid #e5e7eb",
    color: "#1d1d22",
  },
  cancelDeleteBtn: {
    padding: "8px 18px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "transparent",
    color: "#4b5563",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmDeleteBtn: {
    padding: "8px 18px",
    borderRadius: "6px",
    border: "none",
    background: "#f44336",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
};
