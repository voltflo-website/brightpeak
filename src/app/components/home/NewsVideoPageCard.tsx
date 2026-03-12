"use client";
import { useState, useRef, useEffect } from "react";
import { sanitizeHtml } from "../../lib/sanitize";

interface NewsVideoPageItem {
  title: string;
  summary: string;
  image: string;
  date: string;
  url: string;
  content?: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function getVideoInfo(url: string): { type: "iframe" | "native" | "link"; src: string } | null {
  if (!url || !url.trim()) return null;
  const ytId = getYouTubeId(url);
  if (ytId) return { type: "iframe", src: `https://www.youtube.com/embed/${ytId}?autoplay=1` };
  if (url.match(/facebook\.com|fb\.watch|instagram\.com|tiktok\.com/i)) return { type: "link", src: url };
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: "native", src: url };
  if (url.startsWith("/") || url.startsWith("http")) return { type: "iframe", src: url };
  return null;
}

export function VideoPageCard({ item, defaultThumbnail, collapseKey: _ck }: { item: NewsVideoPageItem; defaultThumbnail?: string; collapseKey?: number }) {
  const [playing, setPlaying] = useState(false);
  const videoInfo = item.url ? getVideoInfo(item.url) : null;
  const hasImage = item.image && item.image.trim() !== "";
  const thumbSrc = hasImage ? item.image : (getYouTubeThumbnail(item.url) || defaultThumbnail);

  const handlePlay = () => {
    if (!videoInfo) return;
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "video_play", video_title: item.title || "", video_url: item.url || "" });
    }
    if (videoInfo.type === "link") {
      window.open(videoInfo.src, "_blank", "noopener,noreferrer");
    } else {
      setPlaying(true);
    }
  };

  return (
    <div className="nv-page-card">
      <div className={`nv-page-card-img${videoInfo ? " nv-page-card-embed" : ""}`}>
        {playing && videoInfo && videoInfo.type !== "link" ? (
          videoInfo.type === "native" ? (
            <video autoPlay controls playsInline>
              <source src={videoInfo.src} />
            </video>
          ) : (
            <iframe
              src={videoInfo.src}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        ) : (
          <div
            className={videoInfo ? "nv-thumbnail" : undefined}
            onClick={handlePlay}
            style={videoInfo ? { cursor: "pointer", width: "100%", height: "100%" } : undefined}
          >
            <img src={thumbSrc} alt={item.title} loading="lazy" />
            {videoInfo && <div className="nv-play-btn"><span>▶</span></div>}
          </div>
        )}
        <span className="nv-badge nv-badge-video">▶ Video</span>
      </div>
      <div className="nv-page-card-body">
        <span className="nv-date">{formatDate(item.date)}</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--text-primary)" }}>
          {item.title}
        </h2>
        {item.summary && (
          <div className="nv-rich-content" style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: item.content ? "0.5rem" : "1rem", fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.summary) }} />
        )}
        {item.content && (
          <div className="nv-rich-content" style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
        )}
      </div>
    </div>
  );
}

export function NewsPageCard({ item, collapseKey = 0 }: { item: NewsVideoPageItem; collapseKey?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const hasContent = item.content && item.content.trim().length > 0;

  useEffect(() => {
    if (collapseKey > 0) setExpanded(false);
  }, [collapseKey]);

  useEffect(() => {
    if (!expanded) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [expanded]);

  return (
    <div ref={cardRef} className="nv-page-card">
      <div className="nv-card-news-bar">
        <span className="nv-badge nv-badge-news">📰 News</span>
      </div>
      <div className="nv-page-card-body">
        <span className="nv-date">{formatDate(item.date)}</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--text-primary)" }}>
          {item.title}
        </h2>
        {item.summary && (
          <div className="nv-rich-content" style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: hasContent ? "0.5rem" : "1rem", fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.summary) }} />
        )}
        {hasContent && (
          <div className={`nv-card-content${expanded ? " nv-card-content-expanded" : ""}`} style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content!) }} />
        )}
        {(item as any).slug && (
          <a href={`/news/${(item as any).slug}`} className="nv-full-article-link">
            Full Article &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default function NewsVideoPageCard({ item, kind }: { item: NewsVideoPageItem; kind: "news" | "video" }) {
  if (kind === "video") return <VideoPageCard item={item} />;
  return <NewsPageCard item={item} />;
}
