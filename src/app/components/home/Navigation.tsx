import type { ReactNode } from "react";

const socialIcons: Record<string, ReactNode> = {
  Facebook: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  LinkedIn: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Instagram: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  YouTube: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
};

const navIcons: Record<string, ReactNode> = {
  home: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  business: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  ),
  ev: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2.81A2 2 0 0 1 20 8v8a2 2 0 0 1-2 2h-2" />
      <path d="M22 11v2" />
      <path d="M7 18v-6a4 4 0 0 1 8 0v6" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="15" cy="18" r="2" />
    </svg>
  ),
  news: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  ),
  work: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  about: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  contact: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

interface NavigationProps {
  data?: Record<string, unknown>;
  headerSettings?: Record<string, unknown>;
  siteSettings?: Record<string, unknown>;
  companySettings?: Record<string, unknown>;
  heroCta?: { label: string; href: string };
}

const Navigation = ({ data, headerSettings: headerSettingsProp, siteSettings, companySettings, heroCta }: NavigationProps) => {
  const navData = data as any;
  const company = companySettings as any || {};
  const headerSettings = headerSettingsProp as any || {};
  if (!navData || !navData.enabled) return null;

  const logoSrc = company.logoSrc || navData.logoSrc;
  const logoAlt = company.logoAlt || navData.logoAlt || company.companyName || "";
  const logoPosition = (navData.logoPosition || "navbar").toLowerCase() === "header" ? "header" : "navbar";
  const hideOnMobile = headerSettings.hideOnMobile;
  const hideOnDesktop = headerSettings.hideOnDesktop;
  const headerClass = [
    "nav-utility",
    hideOnMobile ? "header-hide-mobile" : "",
    hideOnDesktop ? "header-hide-desktop" : "",
  ].filter(Boolean).join(" ");

  const links = navData.links || [];
  const dropdowns = links.filter((l: any) => l.type === "dropdown");
  const plainLinks = links.filter((l: any) => l.type !== "dropdown");
  const utilityLinks = navData.utilityLinks || [];
  const socialLinks = company.socialLinks || navData.socialLinks || [];
  const getChildren = (item: any) => item.children || item.links || [];
  const showIcons = navData.showIcons !== false;

  return (
    <nav className={`nav sticky ${logoPosition === "header" ? "logo-in-header" : "logo-in-navbar"}`}>
    <div className={headerClass}>
      <div className="container nav-utility-inner">
        {logoPosition === "header" && (
          <a href="/" className="nav-logo nav-logo-header">
            <img src={logoSrc} alt={logoAlt} />
          </a>
        )}
        <div className="nav-contact">
          {(company.phone || navData.contact?.phone) && (
            <a href={company.phone?.href || navData.contact?.phone?.href}>
              <span className="icon">{company.phone?.icon || navData.contact?.phone?.icon}</span> {company.phone?.label || navData.contact?.phone?.label}
            </a>
          )}
          {(company.email || navData.contact?.email) && (
            <a href={company.email?.href || navData.contact?.email?.href}>
              <span className="icon">{company.email?.icon || navData.contact?.email?.icon}</span> {company.email?.label || navData.contact?.email?.label}
            </a>
          )}
        </div>
        <div className="nav-links-utility">
          {utilityLinks.map((link: any, index: number) => (
            <span key={link.href}>
              <a href={link.href}>{link.label}</a>
              {index < utilityLinks.length - 1 && (
                <span className="sep">|</span>
              )}
            </span>
          ))}
          <div className="nav-social">
            {socialLinks.map((link: any) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                {socialIcons[link.label]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="nav-main">
      <div className="container nav-main-inner">
        {logoPosition === "navbar" && (
          <a href="/" className="nav-logo">
            <img src={logoSrc} alt={logoAlt} />
          </a>
        )}
        <div className="nav-desktop">
          {dropdowns.map((dropdown: any, idx: number) => (
            <div key={`dd-${idx}`} className="nav-dd-wrap" data-dropdown={dropdown.icon || dropdown.label}>
              <button
                type="button"
                className="nav-dd-btn"
                aria-expanded="false"
                aria-controls={`dd-${dropdown.icon || dropdown.label}`}
              >
                {showIcons && dropdown.icon && navIcons[dropdown.icon]}
                {dropdown.label} <span className="chevron">{navData.chevron}</span>
              </button>
              <div id={`dd-${dropdown.icon || dropdown.label}`} className="nav-dd" hidden>
                {getChildren(dropdown).map((link: any) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          {plainLinks.map((link: any, idx: number) => (
            <a key={`pl-${idx}`} href={link.href} className="nav-link">
              {showIcons && link.icon && navIcons[link.icon]}
              {link.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          className="nav-mobile-toggle"
          aria-label={navData.mobile.openMenuLabel}
          data-mobile-toggle
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      </div>
    </div>
    <div className="nav-mobile" data-mobile-menu hidden>
      <div className="nav-mobile-header">
        <a href="/" className="nav-mobile-logo">
          <img src={logoSrc} alt={logoAlt} />
        </a>
        <button type="button" aria-label={navData.mobile.closeMenuLabel} data-mobile-close>
          {navData.mobile.closeLabel}
        </button>
      </div>
      <div className="nav-mobile-links">
        {links.map((item: any, idx: number) =>
          item.type === "dropdown" ? (
            <div key={`mob-${idx}`}>
              <button
                type="button"
                className="nav-mobile-accordion"
                data-accordion={item.icon || item.label}
              >
                <span>{item.label}</span>
                <span className="arrow">{navData.mobileArrow}</span>
              </button>
              <div className="nav-mobile-panel" data-panel={item.icon || item.label} hidden>
                {getChildren(item).map((link: any) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <a key={`mob-${idx}`} href={item.href}>
              {item.label}
            </a>
          )
        )}
        {utilityLinks.length > 0 && (
          <div className="nav-mobile-utility-divider" />
        )}
        {utilityLinks.map((link: any, idx: number) => (
          <a key={`mob-util-${idx}`} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
      <div className="nav-mobile-footer">
        {(company.phone || navData.contact?.phone) && (
          <a href={company.phone?.href || navData.contact?.phone?.href}>
            {company.phone?.icon || navData.contact?.phone?.icon} {company.phone?.label || navData.contact?.phone?.label}
          </a>
        )}
        {(company.email || navData.contact?.email) && (
          <a href={company.email?.href || navData.contact?.email?.href}>
            {company.email?.icon || navData.contact?.email?.icon} {company.email?.label || navData.contact?.email?.label}
          </a>
        )}
      </div>
    </div>
    </nav>
  );
};

export default Navigation;
