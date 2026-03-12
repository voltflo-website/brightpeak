"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(data: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
}

const DataLayerTracker = () => {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const hostname = window.location.hostname;

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;

      if (link) {
        const href = link.href || "";

        if (href.startsWith("tel:")) {
          push({ event: "phone_click", phone_number: link.textContent?.trim() || href });
          return;
        }

        if (href.startsWith("mailto:")) {
          push({ event: "email_click", email_address: link.textContent?.trim() || href });
          return;
        }

        if (link.matches(".btn-primary, .btn-cta, .btn-white, .btn-footer-cta, .btn-outline, .btn-outline-white, .btn-teal")) {
          const section = link.closest("section, footer, nav");
          const sectionId = section?.id || section?.className?.split(" ")[0] || "unknown";
          push({
            event: "cta_click",
            cta_text: link.textContent?.trim() || "",
            cta_url: href,
            cta_section: sectionId,
          });
        }

        if (link.matches(".service-card, .service-card-v2") || link.closest(".service-card, .service-card-v2")) {
          const card = link.matches(".service-card, .service-card-v2") ? link : link.closest(".service-card, .service-card-v2") as HTMLAnchorElement;
          const title = card?.querySelector("h3")?.textContent?.trim() || "";
          push({ event: "service_card_click", service_name: title, service_url: (card as HTMLAnchorElement)?.href || "" });
        }

        try {
          const url = new URL(href);
          if (url.hostname && url.hostname !== hostname && url.protocol.startsWith("http")) {
            const isSocial = !!link.closest(".nav-social, .footer-social");
            if (isSocial) {
              const label = link.getAttribute("aria-label") || link.textContent?.trim() || url.hostname;
              push({ event: "social_click", social_platform: label, social_url: href });
            } else {
              push({ event: "outbound_click", outbound_url: href, outbound_text: link.textContent?.trim() || "" });
            }
          }
        } catch {}
      }

      const btn = target.closest(".btn-primary, .btn-cta, .btn-white, .btn-footer-cta, .btn-outline, .btn-outline-white, .btn-teal") as HTMLElement | null;
      if (btn && !link) {
        const section = btn.closest("section, footer, nav");
        const sectionId = section?.id || section?.className?.split(" ")[0] || "unknown";
        push({
          event: "cta_click",
          cta_text: btn.textContent?.trim() || "",
          cta_url: "",
          cta_section: sectionId,
        });
      }
    };

    document.addEventListener("click", clickHandler);
    cleanups.push(() => document.removeEventListener("click", clickHandler));

    const toggleHandler = (e: Event) => {
      const item = (e.target as HTMLElement).closest(".faq-item") as HTMLDetailsElement | null;
      if (item && item.open) {
        const question = item.querySelector("summary")?.textContent?.trim() || "";
        push({ event: "faq_open", faq_question: question });
      }
    };
    document.addEventListener("toggle", toggleHandler, true);
    cleanups.push(() => document.removeEventListener("toggle", toggleHandler, true));

    const submitHandler = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (form.closest(".admin-sidebar, .admin-page")) return;
      push({ event: "form_submit", form_page: window.location.pathname });
    };
    document.addEventListener("submit", submitHandler);
    cleanups.push(() => document.removeEventListener("submit", submitHandler));

    if ("IntersectionObserver" in window) {
      const sectionMap: Record<string, string> = {
        hero: "Hero",
        services: "Service Cards",
        "why-choose": "Why Choose Us",
        "case-studies": "Case Studies",
        how: "How It Works",
        video: "Video",
        testimonials: "Testimonials",
        impact: "Impact Stats",
        faq: "Solar Guide",
        "news-videos": "News & Videos",
        "final-cta": "Final CTA",
        "contact-section": "Contact CTA",
        "trust-bar": "Trust Bar",
        accreditations: "Accreditations",
      };

      const tracked = new Set<string>();
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = (entry.target as HTMLElement).id;
              if (id && !tracked.has(id)) {
                tracked.add(id);
                push({
                  event: "section_view",
                  section_name: sectionMap[id] || id,
                  section_id: id,
                });
              }
            }
          });
        },
        { threshold: 0.3 }
      );

      document.querySelectorAll<HTMLElement>("section[id], footer[id]").forEach((el) => {
        sectionObserver.observe(el);
      });

      const sections = document.querySelectorAll<HTMLElement>("section[class]");
      sections.forEach((section) => {
        const cls = section.className;
        for (const key of Object.keys(sectionMap)) {
          if (cls.includes(key) && !section.id) {
            section.id = key;
            sectionObserver.observe(section);
            break;
          }
        }
      });

      cleanups.push(() => sectionObserver.disconnect());
    }

    const scrollMilestones = new Set<number>();
    const scrollHandler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.round((scrollTop / docHeight) * 100);
      for (const milestone of [25, 50, 75, 100]) {
        if (percent >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          push({ event: "scroll_depth", scroll_percentage: milestone });
        }
      }
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", scrollHandler));

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
};

export default DataLayerTracker;
