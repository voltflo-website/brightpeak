"use client";

import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import type { HomeData } from "../../lib/loadAllHomeData";

const HomePageClient = ({ allData }: { allData: HomeData }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const cleanupHandlers: Array<() => void> = [];
    const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
    const mobileToggle = document.querySelector<HTMLButtonElement>(
      "[data-mobile-toggle]"
    );
    const mobileClose = document.querySelector<HTMLButtonElement>(
      "[data-mobile-close]"
    );

    const openMobileMenu = () => {
      if (mobileMenu) {
        mobileMenu.hidden = false;
        document.body.style.overflow = "hidden";
      }
    };

    const closeMobileMenu = () => {
      if (mobileMenu) {
        mobileMenu.hidden = true;
        document.body.style.overflow = "";
      }
      document.querySelectorAll<HTMLElement>(".nav-mobile-panel").forEach((panel) => {
        panel.hidden = true;
      });
      document
        .querySelectorAll<HTMLElement>(".nav-mobile-accordion")
        .forEach((btn) => {
          btn.removeAttribute("data-open");
        });
    };

    if (mobileToggle) {
      const handleMobileToggle = () => {
        if (mobileMenu && mobileMenu.hidden) {
          openMobileMenu();
        } else {
          closeMobileMenu();
        }
      };
      mobileToggle.addEventListener("click", handleMobileToggle);
      cleanupHandlers.push(() =>
        mobileToggle.removeEventListener("click", handleMobileToggle)
      );
    }

    if (mobileClose) {
      mobileClose.addEventListener("click", closeMobileMenu);
      cleanupHandlers.push(() =>
        mobileClose.removeEventListener("click", closeMobileMenu)
      );
    }

    document
      .querySelectorAll<HTMLButtonElement>(".nav-mobile-accordion")
      .forEach((btn) => {
        const handleAccordion = () => {
          const panelId = btn.getAttribute("data-accordion");
          const panel = document.querySelector<HTMLElement>(
            `.nav-mobile-panel[data-panel="${panelId}"]`
          );
          if (!panel) return;

          const isOpen = !panel.hidden;

          document
            .querySelectorAll<HTMLElement>(".nav-mobile-panel")
            .forEach((p) => {
              p.hidden = true;
            });
          document
            .querySelectorAll<HTMLElement>(".nav-mobile-accordion")
            .forEach((b) => {
              b.removeAttribute("data-open");
            });

          if (!isOpen) {
            panel.hidden = false;
            btn.setAttribute("data-open", "true");
          }
        };

        btn.addEventListener("click", handleAccordion);
        cleanupHandlers.push(() =>
          btn.removeEventListener("click", handleAccordion)
        );
      });

    document.querySelectorAll<HTMLAnchorElement>(".nav-mobile a").forEach((link) => {
      const handleLinkClick = () => closeMobileMenu();
      link.addEventListener("click", handleLinkClick);
      cleanupHandlers.push(() =>
        link.removeEventListener("click", handleLinkClick)
      );
    });

    const dropdownWraps = Array.from(
      document.querySelectorAll<HTMLElement>(".nav-dd-wrap[data-dropdown]")
    );

    dropdownWraps.forEach((wrap) => {
      const btn = wrap.querySelector<HTMLButtonElement>(".nav-dd-btn");
      const panel = wrap.querySelector<HTMLElement>(".nav-dd");
      if (!btn || !panel) return;

      const handleDropdownClick = (event: MouseEvent) => {
        event.stopPropagation();
        const isOpen = wrap.getAttribute("data-open") === "true";

        dropdownWraps.forEach((other) => {
          other.removeAttribute("data-open");
          const otherPanel = other.querySelector<HTMLElement>(".nav-dd");
          if (otherPanel) otherPanel.hidden = true;
          const otherButton = other.querySelector<HTMLButtonElement>(".nav-dd-btn");
          if (otherButton) otherButton.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          wrap.setAttribute("data-open", "true");
          panel.hidden = false;
          btn.setAttribute("aria-expanded", "true");
        }
      };

      btn.addEventListener("click", handleDropdownClick);
      cleanupHandlers.push(() =>
        btn.removeEventListener("click", handleDropdownClick)
      );
    });

    const handleDocumentClick = (event: MouseEvent) => {
      dropdownWraps.forEach((wrap) => {
        if (!wrap.contains(event.target as Node)) {
          wrap.removeAttribute("data-open");
          const panel = wrap.querySelector<HTMLElement>(".nav-dd");
          if (panel) panel.hidden = true;
          const btn = wrap.querySelector<HTMLButtonElement>(".nav-dd-btn");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });
    };
    document.addEventListener("click", handleDocumentClick);
    cleanupHandlers.push(() =>
      document.removeEventListener("click", handleDocumentClick)
    );

    dropdownWraps.forEach((wrap) => {
      const handleWrapClick = (event: MouseEvent) => event.stopPropagation();
      wrap.addEventListener("click", handleWrapClick);
      cleanupHandlers.push(() =>
        wrap.removeEventListener("click", handleWrapClick)
      );
    });

    const video = document.getElementById("intro-video") as HTMLVideoElement | null;
    const videoBtn = document.getElementById(
      "video-play-btn"
    ) as HTMLButtonElement | null;

    let videoObserver: IntersectionObserver | null = null;

    if (video && videoBtn) {
      const handleVideoToggle = () => {
        if (video.paused) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      };

      const handleVideoPlay = () => videoBtn.classList.add("playing");
      const handleVideoPause = () => videoBtn.classList.remove("playing");
      const handleVideoEnd = () => {
        videoBtn.classList.remove("playing");
        video.currentTime = 0;
      };

      videoBtn.addEventListener("click", handleVideoToggle);
      video.addEventListener("play", handleVideoPlay);
      video.addEventListener("pause", handleVideoPause);
      video.addEventListener("ended", handleVideoEnd);

      cleanupHandlers.push(() =>
        videoBtn.removeEventListener("click", handleVideoToggle)
      );
      cleanupHandlers.push(() => video.removeEventListener("play", handleVideoPlay));
      cleanupHandlers.push(() => video.removeEventListener("pause", handleVideoPause));
      cleanupHandlers.push(() => video.removeEventListener("ended", handleVideoEnd));

      if ("IntersectionObserver" in window) {
        videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                if (window.innerWidth >= 768) {
                  video.play().catch(() => undefined);
                }
              } else if (!entry.isIntersecting && !video.paused) {
                video.pause();
              }
            });
          },
          { threshold: [0.5] }
        );

        if (video.parentElement) {
          videoObserver.observe(video.parentElement);
        }
      }
    }

    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
      const handleAnchorClick = (event: MouseEvent) => {
        const target = document.querySelector<HTMLElement>(
          anchor.getAttribute("href") || ""
        );
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      anchor.addEventListener("click", handleAnchorClick);
      cleanupHandlers.push(() =>
        anchor.removeEventListener("click", handleAnchorClick)
      );
    });

    const nav = document.querySelector<HTMLElement>(".nav");
    if (nav) {
      const handleScroll = () => {
        if (window.pageYOffset > 100) {
          nav.classList.add("scrolled");
        } else {
          nav.classList.remove("scrolled");
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      cleanupHandlers.push(() =>
        window.removeEventListener("scroll", handleScroll)
      );
    }

    // ===== HERO ENTRANCE ANIMATION =====
    const heroText = document.querySelector<HTMLElement>(".hero-text");
    if (heroText) {
      const eyebrow = heroText.querySelector<HTMLElement>(".eyebrow-wrap");
      const headline = heroText.querySelector<HTMLElement>(".hero-headline");
      const sub = heroText.querySelector<HTMLElement>(".hero-sub");
      const ctas = heroText.querySelector<HTMLElement>(".hero-ctas");
      const badges = heroText.querySelector<HTMLElement>(".hero-badges");

      if (eyebrow) eyebrow.classList.add("hero-entrance");
      if (headline) headline.classList.add("hero-entrance");
      if (sub) sub.classList.add("hero-entrance-delay");
      if (ctas) ctas.classList.add("hero-entrance-delay-2");
      if (badges) badges.classList.add("hero-entrance-delay-2");
    }

    const heroFloats = document.querySelector<HTMLElement>(".hero-floats");
    if (heroFloats) {
      const floatElements = heroFloats.querySelectorAll<HTMLElement>(
        ".hero-award, .hero-stats-float, .hero-cert"
      );
      floatElements.forEach((el, i) => {
        el.classList.add("hero-float-enter");
        el.style.setProperty("--float-delay", `${0.6 + i * 0.2}s`);
      });
    }

    // ===== SCROLL-TRIGGERED ANIMATIONS =====
    let scrollObserver: IntersectionObserver | null = null;
    let staggerObserver: IntersectionObserver | null = null;
    let counterObserver: IntersectionObserver | null = null;
    const staggerTimers: ReturnType<typeof setTimeout>[] = [];
    const extraObservers: IntersectionObserver[] = [];

    if ("IntersectionObserver" in window) {
      // General scroll reveal for individual elements
      const scrollElements = document.querySelectorAll<HTMLElement>(
        ".service-card, .service-card-v2, .case-card, .how-step, .testimonial-card, .service-card-lg, .video-wrap, .why-img, .why-content, .faq-list, .trust-bar-inner, .rating-badge"
      );

      scrollElements.forEach((el) => {
        el.classList.add("animate-on-scroll");
      });

      // Slide directions for the why-choose 2-col layout
      const whyImg = document.querySelector<HTMLElement>(".why-img.animate-on-scroll");
      if (whyImg) whyImg.classList.add("slide-left");

      const whyContent = document.querySelector<HTMLElement>(".why-content.animate-on-scroll");
      if (whyContent) whyContent.classList.add("slide-right");

      const videoWrap = document.querySelector<HTMLElement>(".video-wrap.animate-on-scroll");
      if (videoWrap) videoWrap.classList.add("scale-in");

      scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );

      scrollElements.forEach((el) => scrollObserver?.observe(el));

      // Section header animations
      const sectionContainers = document.querySelectorAll<HTMLElement>(
        ".section > .container, .video-section > .container, .case-studies > .container"
      );
      sectionContainers.forEach((container) => {
        const hasHeader = container.querySelector(".section-eyebrow, .section-title");
        if (hasHeader) {
          container.classList.add("section-header-animate");
          scrollObserver?.observe(container);
        }
      });

      // Stagger children in grids
      const staggerGrids = document.querySelectorAll<HTMLElement>(
        ".service-cards, .service-cards-v2, .how-grid, .testimonials-grid, .case-grid, .impact-grid, .services-grid"
      );

      staggerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const children = entry.target.children;
              Array.from(children).forEach((child, i) => {
                const el = child as HTMLElement;
                el.classList.add("stagger-child");
                const timer = setTimeout(() => {
                  el.classList.add("visible");
                }, 100 + i * 120);
                staggerTimers.push(timer);
              });
              staggerObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
      );

      staggerGrids.forEach((grid) => staggerObserver?.observe(grid));

      // Partners logo animation
      const partnerLogos = document.querySelectorAll<HTMLElement>(".partners-logos");
      partnerLogos.forEach((logos) => {
        logos.classList.add("animated");
        const logoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const imgs = entry.target.querySelectorAll("img");
                imgs.forEach((img, i) => {
                  (img as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
                });
                entry.target.classList.add("visible");
                logoObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );
        logoObserver.observe(logos);
        extraObservers.push(logoObserver);
      });

      // Counter animation for impact values
      const impactValues = document.querySelectorAll<HTMLElement>(".impact-value");
      if (impactValues.length > 0) {
        counterObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const el = entry.target as HTMLElement;
                const parent = el.closest(".impact-item");
                if (parent) parent.classList.add("visible");
                const finalText = el.textContent || "";
                const numMatch = finalText.match(/([\d,]+)/);
                if (numMatch) {
                  const idx = finalText.indexOf(numMatch[0]);
                  const prefix = finalText.substring(0, idx);
                  const suffix = finalText.substring(idx + numMatch[0].length);
                  const target = parseInt(numMatch[0].replace(/,/g, ""), 10);
                  const duration = 1500;
                  const startTime = performance.now();
                  el.classList.add("counter-animate");

                  const animate = (now: number) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);
                    el.textContent =
                      prefix + current.toLocaleString() + suffix;
                    if (progress < 1) {
                      requestAnimationFrame(animate);
                    } else {
                      el.textContent = finalText;
                      el.classList.add("counting");
                    }
                  };
                  requestAnimationFrame(animate);
                }
                counterObserver?.unobserve(el);
              }
            });
          },
          { threshold: 0.5 }
        );

        impactValues.forEach((el) => counterObserver?.observe(el));
      }

      const whyStats = document.querySelectorAll<HTMLElement>(".why-stats strong");
      if (whyStats.length > 0) {
        const whyCounterObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const el = entry.target as HTMLElement;
                const finalText = el.textContent || "";
                const numMatch = finalText.match(/([\d,]+)/);
                if (numMatch) {
                  const prefix = finalText.substring(0, finalText.indexOf(numMatch[0]));
                  const suffix = finalText.substring(finalText.indexOf(numMatch[0]) + numMatch[0].length);
                  const target = parseInt(numMatch[0].replace(/,/g, ""), 10);
                  const duration = 1200;
                  const startTime = performance.now();

                  const animate = (now: number) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);
                    el.textContent = prefix + current.toLocaleString() + suffix;
                    if (progress < 1) {
                      requestAnimationFrame(animate);
                    } else {
                      el.textContent = finalText;
                    }
                  };
                  requestAnimationFrame(animate);
                }
                whyCounterObserver.unobserve(el);
              }
            });
          },
          { threshold: 0.5 }
        );
        whyStats.forEach((el) => whyCounterObserver.observe(el));
        extraObservers.push(whyCounterObserver);
      }
    }

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
      staggerTimers.forEach((t) => clearTimeout(t));
      videoObserver?.disconnect();
      scrollObserver?.disconnect();
      staggerObserver?.disconnect();
      counterObserver?.disconnect();
      extraObservers.forEach((obs) => obs.disconnect());
    };
  }, [mounted]);

  return <HomePage allData={allData} />;
};

export default HomePageClient;
