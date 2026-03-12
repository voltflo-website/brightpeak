"use client";
import { useState } from "react";

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const VideoSection = ({ data }: { data: Record<string, unknown> }) => {
  const videoData = data as any;
  const [playing, setPlaying] = useState(false);
  if (!videoData.enabled) return null;

  const videoUrl: string = videoData.video?.src || "";
  const ytId = getYouTubeId(videoUrl);
  const thumbSrc = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "";
  const embedSrc = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1` : "";

  const handlePlay = () => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "video_play", video_title: videoData.title || "", video_url: videoUrl });
    }
    if (ytId) {
      setPlaying(true);
    } else if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section id="video" className="video-section">
      <div className="container">
        <p className="section-eyebrow">{videoData.eyebrow}</p>
        <h2 className="section-title">{videoData.title}</h2>
        <p className="section-sub">{videoData.subtitle}</p>
        <div className="video-wrap">
          {playing && embedSrc ? (
            <div className="video-embed-container">
              <iframe
                src={embedSrc}
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="nv-thumbnail" onClick={handlePlay} style={{ cursor: "pointer" }}>
              {thumbSrc ? (
                <img src={thumbSrc} alt={videoData.title} loading="lazy" />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#000" }} />
              )}
              <div className="nv-play-btn"><span>▶</span></div>
            </div>
          )}
        </div>
        <p className="video-caption">{videoData.caption}</p>
      </div>
    </section>
  );
};

export default VideoSection;
