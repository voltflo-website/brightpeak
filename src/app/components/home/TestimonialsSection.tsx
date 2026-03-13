"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const TestimonialsSection = ({ data }: { data: Record<string, unknown> }) => {
  const testimonialsData = data as any;
  if (!testimonialsData.enabled) return null;

  const allItems = testimonialsData.groups.flatMap((group: any) =>
    group.items.map((item: any) => ({ ...item, tone: group.tone }))
  );

  return (
    <section id="testimonials" className="section section-light testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <div className="rating-badge">
            <span className="stars">{testimonialsData.ratingStars}</span>
            <span className="rating-text">{testimonialsData.ratingLabel}</span>
          </div>
          <h2 className="section-title">{testimonialsData.title}</h2>
          <p className="section-sub">{testimonialsData.subtitle}</p>
        </div>

        <TestimonialsCarousel items={allItems} quoteMark={testimonialsData.quoteMark} ratingStars={testimonialsData.ratingStars} />

        <div className="testimonials-cta">
          <a
            href={testimonialsData.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-teal"
          >
            {testimonialsData.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
};

interface CarouselItem {
  company: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  variant: string;
  tone: string;
  images?: string[];
}

function TestimonialsCarousel({ items, quoteMark, ratingStars }: { items: CarouselItem[]; quoteMark: string; ratingStars: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);

  const updateVisibleCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) setVisibleCount(1);
    else if (width < 768) setVisibleCount(2);
    else setVisibleCount(3);
  }, []);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [updateVisibleCount]);

  const maxIndex = Math.max(0, items.length - visibleCount);

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const pushTestimonialView = useCallback((idx: number) => {
    const visible = items.slice(idx, idx + visibleCount);
    visible.forEach((item) => {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "testimonial_view",
          testimonial_author: item.author || "",
          testimonial_company: item.company || "",
        });
      }
    });
  }, [items, visibleCount]);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex((prev) => {
      if (prev !== clamped) pushTestimonialView(clamped);
      return clamped;
    });
  }, [maxIndex, pushTestimonialView]);

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const gapPercent = 1.25;
  const cardPercent = visibleCount === 1
    ? 100
    : visibleCount === 2
      ? (100 - gapPercent) / 2
      : (100 - gapPercent * 2) / 3;
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
    <div className="testimonials-carousel">
      <button
        className="carousel-arrow carousel-arrow-left"
        onClick={prev}
        disabled={currentIndex === 0}
        aria-label="Previous reviews"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div
        className="testimonials-track-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="testimonials-track"
          ref={trackRef}
          style={{ transform: `translateX(${translateX}%)`, transition: "transform 0.4s ease" }}
        >
          {items.map((item, i) => (
            <TestimonialCard key={`${item.author}-${i}`} item={item} quoteMark={quoteMark} ratingStars={ratingStars} />
          ))}
        </div>
      </div>

      <button
        className="carousel-arrow carousel-arrow-right"
        onClick={next}
        disabled={currentIndex >= maxIndex}
        aria-label="Next reviews"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div className="carousel-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to review ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TestimonialImageSlideshow({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="testimonial-images">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Customer testimonial image ${i + 1}`}
          loading="lazy"
          className={`testimonial-slide-img ${i === activeIndex ? "active" : ""}`}
        />
      ))}
      {images.length > 1 && (
        <div className="testimonial-img-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`testimonial-img-dot ${i === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ item, quoteMark, ratingStars }: { item: CarouselItem; quoteMark: string; ratingStars: string }) {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [needsTruncation, setNeedsTruncation] = useState(false);

  const images = (item.images || []).filter((s) => s && s.trim() !== "");

  useEffect(() => {
    if (textRef.current) {
      setNeedsTruncation(textRef.current.scrollHeight > 200);
    }
  }, [item.quote]);

  return (
    <div className={`testimonial-card ${item.variant}`}>
      {images.length > 0 && <TestimonialImageSlideshow images={images} />}
      <div className="testimonial-top">
        {item.company ? (
          <span className="company-badge">{item.company}</span>
        ) : null}
      </div>
      <div className={`stars ${item.variant === "b2b" ? "small" : ""}`}>
        {ratingStars}
      </div>
      <div className={`testimonial-text-wrap ${expanded ? "expanded" : ""}`}>
        <p className="testimonial-text" ref={textRef}>
          {quoteMark}{item.quote}{quoteMark}
        </p>
        {!expanded && needsTruncation && <div className="testimonial-fade" />}
      </div>
      {needsTruncation && (
        <button
          className="testimonial-more-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      <div className="testimonial-author">
        <div className={`author-avatar ${item.variant}`}>{item.avatar}</div>
        <div>
          <strong>{item.author}</strong>
          <span>{item.role}</span>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSection;
