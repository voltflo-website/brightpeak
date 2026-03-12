import type { ReactNode } from "react";
import { getUrlForVariant, externalLinkProps } from "../../lib/siteSettings";

const socialIcons: Record<string, ReactNode> = {
  Facebook: (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  LinkedIn: (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Instagram: (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
};

interface FooterProps {
  data?: Record<string, unknown>;
  siteSettings?: Record<string, unknown>;
  companySettings?: Record<string, unknown>;
  heroCta?: { label: string; href: string };
}

const Footer = ({ data, siteSettings, companySettings, heroCta }: FooterProps) => {
  const footerData = data as any;
  const company = companySettings as any || {};
  if (!footerData || !footerData.enabled) return null;

  const footerStyle = footerData.footerStyle || "dark";

  return (
    <footer className={`footer${footerStyle === "light" ? " footer-light" : ""}`}>
    {footerData.founder?.enabled && (
    <div className="container footer-top-row">
      <div className="footer-founder">
        <img src={footerData.founder.imageSrc} alt={footerData.founder.label || "Founder"} className="footer-founder-img" loading="lazy" />
        <span className="footer-founder-label">{footerData.founder.label || "Founder"}</span>
      </div>
    </div>
    )}
    <div className="container footer-grid">
      <div className="footer-brand">
        <a href="/" className="footer-logo">
          <img src={company.logoSrc || footerData.logoSrc} alt={company.logoAlt || footerData.logoAlt || company.companyName || ""} loading="lazy" />
        </a>
        <p className="footer-tagline">{footerData.tagline}</p>
        <p className="footer-badges">{footerData.badges.primary}</p>
        <p className="footer-badges-sub">{footerData.badges.secondary}</p>
        <div className="footer-social">
          {(company.socialLinks || footerData.socialLinks || []).map((link: any) => (
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
      {footerData.columns.map((column: any) => (
        <div key={column.title}>
          <h4>{column.title}</h4>
          <ul>
            {column.links.map((link: any) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="footer-contact">
        <h4>{footerData.contact.heading}</h4>
        {company.phone?.href && (
          <p>
            <a href={company.phone.href}>
              <span className="footer-icon">{footerData.contact.phoneIcon}</span> {company.phone.label}
            </a>
          </p>
        )}
        {company.email?.href && (
          <p>
            <a href={company.email.href}>
              <span className="footer-icon">{footerData.contact.emailIcon}</span> {company.email.label}
            </a>
          </p>
        )}
        {company.address && (
          <p>
            <span className="footer-icon">{footerData.contact.locationIcon}</span> {[company.address.line1, company.address.line2, company.address.city, company.address.county, company.address.country].filter(Boolean).join(", ")}
          </p>
        )}
        <a
          href={getUrlForVariant(footerData.contact.cta.variant, siteSettings)}
          className="btn btn-footer-cta"
          {...externalLinkProps(getUrlForVariant(footerData.contact.cta.variant, siteSettings))}
        >
          {heroCta?.label || footerData.contact.cta.label}
        </a>
        {company.openingHours && <p className="footer-hours">{company.openingHours}</p>}
      </div>
    </div>
    <div className="footer-bottom container">
      <p>{company.copyright || footerData.bottom.copyright}</p>
      <div>
        {footerData.bottom.links.map((link: any) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
    </footer>
  );
};

export default Footer;
