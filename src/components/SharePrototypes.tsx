"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./SharePrototypes.module.css";

interface SharePrototypesProps {
  slug: string;
  prototypes: string[];
  finalPrototypes: string[];
}

function protoLabel(path: string): string {
  return path
    .replace(/^\/prototypes\//, "")
    .replace(/\.html$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SharePrototypes({
  slug,
  prototypes,
  finalPrototypes,
}: SharePrototypesProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedProto, setCopiedProto] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const allPrototypes = [...prototypes, ...finalPrototypes];

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Generate token when popover opens
  const generateToken = useCallback(async () => {
    if (token) return; // already generated
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, prototypes: allPrototypes }),
      });
      const data = await res.json();
      if (res.ok) setToken(data.token);
    } catch (err) {
      console.error("Share token error:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, allPrototypes, token]);

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) generateToken();
  }

  async function copyLink(proto: string) {
    if (!token) return;
    const filename = proto.replace(/^\/prototypes\//, "");
    const url = `${window.location.origin}/output/prototypes/${filename}?share=${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedProto(proto);
    setTimeout(() => setCopiedProto(null), 2000);
  }

  if (allPrototypes.length === 0) return null;

  return (
    <div className={styles.wrapper} ref={popoverRef}>
      <button
        className={styles.trigger}
        onClick={handleOpen}
        aria-label="Share prototypes"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {open && (
        <div className={styles.popover}>
          <p className={styles.popoverTitle}>Share prototype links</p>

          {loading && <p className={styles.loading}>Generating links...</p>}

          {!loading && token && (
            <>
              {prototypes.length > 0 && (
                <div className={styles.group}>
                  <span className={styles.groupLabel}>To review</span>
                  {prototypes.map((proto) => (
                    <div key={proto} className={styles.linkRow}>
                      <span className={styles.linkLabel}>{protoLabel(proto)}</span>
                      <button
                        className={styles.copyIcon}
                        onClick={() => copyLink(proto)}
                        aria-label={`Copy link for ${protoLabel(proto)}`}
                      >
                        {copiedProto === proto ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {finalPrototypes.length > 0 && (
                <div className={styles.group}>
                  <span className={styles.groupLabel}>Final</span>
                  {finalPrototypes.map((proto) => (
                    <div key={proto} className={styles.linkRow}>
                      <span className={styles.linkLabel}>{protoLabel(proto)}</span>
                      <button
                        className={styles.copyIcon}
                        onClick={() => copyLink(proto)}
                        aria-label={`Copy link for ${protoLabel(proto)}`}
                      >
                        {copiedProto === proto ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
