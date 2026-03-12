"use client";

import { useEffect, type ReactNode } from "react";
import Navigation from "./home/Navigation";
import Footer from "./home/Footer";

interface PageLayoutProps {
  children: ReactNode;
  navData?: Record<string, unknown>;
  footerData?: Record<string, unknown>;
  headerSettings?: Record<string, unknown>;
  siteSettings?: Record<string, unknown>;
  companySettings?: Record<string, unknown>;
  heroCta?: { label: string; href: string };
}

const PageLayout = ({ children, navData, footerData, headerSettings, siteSettings, companySettings, heroCta }: PageLayoutProps) => {
  useEffect(() => {
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

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation data={navData} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta} />
      <main>{children}</main>
      <Footer data={footerData} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta} />
    </div>
  );
};

export default PageLayout;
