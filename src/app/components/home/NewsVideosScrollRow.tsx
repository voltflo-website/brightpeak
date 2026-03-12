"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

export default function NewsVideosScrollRow({ children, label, itemCount }: { children: React.ReactNode; label: string; itemCount: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collapseKey, setCollapseKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
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

  const maxIndex = Math.max(0, itemCount - visibleCount);

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    setCollapseKey((k) => k + 1);
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
    <div className="nv-carousel-section">
      <h3 className="nv-carousel-label">{label}</h3>
      <div className="nv-carousel">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label={`Previous ${label}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div
          className="nv-track-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="nv-track"
            style={{ transform: `translateX(${translateX}%)`, transition: "transform 0.4s ease" }}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, { collapseKey })
                : child
            )}
          </div>
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={next}
          disabled={currentIndex >= maxIndex}
          aria-label={`Next ${label}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {maxIndex > 0 && (
        <div className="carousel-dots" style={{ position: "relative", bottom: "auto", left: "auto", transform: "none", justifyContent: "center", marginTop: "1.5rem" }}>
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
