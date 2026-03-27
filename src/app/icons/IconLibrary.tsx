"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./page.module.css";

interface IconItem {
  name: string;
  filename: string;
  url: string;
  category: string;
  svgContent: string;
}

interface IconLibraryProps {
  monotone: IconItem[];
  duotone: IconItem[];
}

type Category = "all" | "monotone" | "duotone";

export function IconLibrary({ monotone, duotone }: IconLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<"monotone" | "duotone">("monotone");

  const allIcons = [...monotone, ...duotone];

  const filtered = (category === "all" ? allIcons : category === "monotone" ? monotone : duotone)
    .filter((icon) =>
      search ? icon.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleDownload = (icon: IconItem) => {
    const blob = new Blob([icon.svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = icon.filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${icon.name}.svg`);
  };

  const handleCopySvg = (icon: IconItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(icon.svgContent);
    showToast(`Copied SVG code for ${icon.name}`);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("category", uploadCategory);
    Array.from(files).forEach((f) => formData.append("icons", f));

    try {
      const res = await fetch("/api/icons", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setUploadStatus(`Uploaded ${data.uploaded.length} icon(s). Refresh to see them.`);
      } else {
        setUploadStatus(data.error || "Upload failed");
      }
    } catch {
      setUploadStatus("Upload failed — network error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const counts = {
    all: allIcons.length,
    monotone: monotone.length,
    duotone: duotone.length,
  };

  return (
    <section className={styles.main}>
      <div className={styles.container}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.categoryTabs}>
            {(["all", "monotone", "duotone"] as Category[]).map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${category === cat ? styles.categoryTabActive : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className={styles.count}>{counts[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload bar */}
        <div
          className={`${styles.uploadBar} ${dragOver ? styles.dragOver : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className={styles.uploadBarText}>
            Drag & drop SVG files here, or click upload. Icons are committed to the repo automatically.
          </span>
          <div className={styles.categoryTabs}>
            {(["monotone", "duotone"] as const).map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${uploadCategory === cat ? styles.categoryTabActive : ""}`}
                onClick={() => setUploadCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <button
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload SVGs"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.hiddenInput}
            accept=".svg"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploadStatus && (
            <span className={uploadStatus.includes("fail") || uploadStatus.includes("error") ? styles.uploadError : styles.uploadStatus}>
              {uploadStatus}
            </span>
          )}
        </div>

        {/* Icons grid */}
        {filtered.length > 0 ? (
          <div className={styles.iconsGrid}>
            {filtered.map((icon, i) => (
              <div
                key={`${icon.category}-${icon.name}`}
                className={styles.iconCard}
                onClick={() => handleDownload(icon)}
                onContextMenu={(e) => handleCopySvg(icon, e)}
                title={`${icon.name} (${icon.category}) — Click to download, right-click to copy SVG`}
                style={{ animationDelay: `${Math.min(i, 30) * 15}ms` }}
              >
                <div
                  className={styles.iconPreview}
                  dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                />
                <span className={styles.iconName}>{icon.name}</span>
                <div className={styles.downloadHint}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No icons found</h3>
            <p className={styles.emptyText}>
              {search
                ? `No icons match "${search}". Try a different search term.`
                : "No icons in this category yet. Upload some SVGs to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ""}`}>
        {toast}
      </div>
    </section>
  );
}
