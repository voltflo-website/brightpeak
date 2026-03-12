"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { sanitizeHtml } from "../../lib/sanitize";

const VIDEO_RE = /\.(mp4|webm|ogg|mov)$/i;

function getEmbedUrl(url: string): string | null {
  if (!url || !url.trim()) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/shorts/")[1]?.split(/[/?]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split(/[/?]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "www.youtube.com" && u.pathname.startsWith("/embed/")) {
      return url;
    }
    if (u.hostname === "player.vimeo.com") return url;
    if (u.hostname === "vimeo.com") {
      const id = u.pathname.slice(1).split(/[/?]/)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

const CaseStudiesSection = ({ data }: { data: Record<string, unknown> }) => {
  const caseStudiesData = data as any;
  if (!caseStudiesData.enabled) return null;

  const cards = caseStudiesData.cards;

  return (
    <section id="case-studies" className="section case-studies">
      <div className="container">
        <p className="section-eyebrow">{caseStudiesData.eyebrow}</p>
        <h2 className="section-title">{caseStudiesData.title}</h2>
        <p className="section-sub">{caseStudiesData.subtitle}</p>
        <CaseStudiesCarousel cards={cards} />
      </div>
    </section>
  );
};

interface CaseCard {
  slug?: string;
  image: { src: string; alt: string };
  images?: string[];
  video?: string;
  sub: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
}

function CaseImageSlideshow({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  return (
    <div className="case-slideshow-wrap">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          loading="lazy"
          className={`case-slide-img ${i === activeIndex ? "active" : ""}`}
        />
      ))}
      {images.length > 1 && (
        <div className="case-img-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`case-img-dot ${i === activeIndex ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseCardItem({ card, collapseKey = 0 }: { card: CaseCard; collapseKey?: number }) {
  const descRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  useEffect(() => {
    if (collapseKey > 0) setExpanded(false);
  }, [collapseKey]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 22;
      setIsTruncated(el.scrollHeight > lineHeight * 4 + 2);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [card.description]);

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

  const handleCtaClick = (e: React.MouseEvent) => {
    if (isTruncated && !expanded) {
      e.preventDefault();
      e.stopPropagation();
      setExpanded(true);
    }
  };

  const embedUrl = getEmbedUrl(card.video || "");
  const validImages = (card.images || []).filter((s) => s && s.trim() !== "");
  const useSlideshow = !embedUrl && validImages.length > 0;
  const isNativeVideo = !embedUrl && !useSlideshow && VIDEO_RE.test(card.image.src);

  const inner = (
    <>
      <div
        className={`case-img${useSlideshow ? " case-img-slideshow" : ""}${embedUrl ? " case-img-video" : ""}`}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={card.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="case-embed-video"
          />
        ) : useSlideshow ? (
          <CaseImageSlideshow images={validImages} alt={card.image.alt} />
        ) : isNativeVideo ? (
          <>
            <video
              src={card.image.src}
              muted
              playsInline
              preload="metadata"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLVideoElement).play();
                const btn = e.currentTarget.nextElementSibling as HTMLElement;
                if (btn) btn.style.opacity = "0";
              }}
              onMouseLeave={(e) => {
                const v = e.currentTarget as HTMLVideoElement;
                v.pause();
                v.currentTime = 0;
                const btn = e.currentTarget.nextElementSibling as HTMLElement;
                if (btn) btn.style.opacity = "1";
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div className="case-play-btn">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
            </div>
          </>
        ) : (
          <img src={card.image.src} alt={card.image.alt} loading="lazy" />
        )}
        <div className="case-overlay"></div>
        <div className="case-info">
          <span className="case-sub">{card.sub}</span>
          <h3>{card.title}</h3>
        </div>
      </div>
      <div className="case-body">
        {card.stats && card.stats.length > 0 && (
          <div className="case-stats">
            {card.stats.map((stat, i) => (
              <div key={i}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
        <div ref={descRef} className={`case-desc rich-html${expanded ? " case-desc-expanded" : ""}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.description || "") }} />
        {isTruncated && !expanded && (
          <span className="case-cta" onClick={handleCtaClick}>More..</span>
        )}
        {card.slug && (
          <a href={`/our-work/${card.slug}`} className="case-view-project" onClick={(e) => e.stopPropagation()}>
            View Project &rarr;
          </a>
        )}
      </div>
    </>
  );

  if (isTruncated && !expanded) {
    return (
      <div ref={cardRef} className={`case-card case-card-link${embedUrl ? " case-card-has-video" : ""}`} style={{ cursor: "pointer" }} onClick={handleCtaClick}>
        {inner}
      </div>
    );
  }

  return (
    <div ref={cardRef} className={`case-card case-card-link${embedUrl ? " case-card-has-video" : ""}`}>
      {inner}
    </div>
  );
}

function CaseStudiesCarousel({ cards }: { cards: CaseCard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [collapseKey, setCollapseKey] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);

  const updateVisibleCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setVisibleCount(1);
    else setVisibleCount(2);
  }, []);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [updateVisibleCount]);

  const maxIndex = Math.max(0, cards.length - visibleCount);

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex((prev) => {
      if (prev !== clamped) setCollapseKey((k) => k + 1);
      return clamped;
    });
  }, [maxIndex]);

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const gapPercent = 1.5;
  const cardPercent = visibleCount === 1
    ? 100
    : (100 - gapPercent) / 2;
  const stepPercent = cardPercent + gapPercent;
  const translateX = -(currentIndex * stepPercent);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      next();
    } else if (touchDeltaX.current > threshold) {
      prev();
    }
    touchDeltaX.current = 0;
  };

  return (
    <div className="case-carousel">
      <button
        className="carousel-arrow carousel-arrow-left"
        onClick={prev}
        disabled={currentIndex === 0}
        aria-label="Previous projects"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div
        className="case-track-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="case-track"
          style={{ transform: `translateX(${translateX}%)`, transition: "transform 0.4s ease" }}
        >
          {cards.map((card, i) => (
            <CaseCardItem key={i} card={card} collapseKey={collapseKey} />
          ))}
        </div>
      </div>

      <button
        className="carousel-arrow carousel-arrow-right"
        onClick={next}
        disabled={currentIndex >= maxIndex}
        aria-label="Next projects"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {maxIndex > 0 && (
        <div className="carousel-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CaseStudiesSection;
