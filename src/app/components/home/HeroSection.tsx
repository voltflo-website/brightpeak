import Image from "next/image";
import { getVoltfloUrl, getContactFormUrl, externalLinkProps } from "../../lib/siteSettings";

const HeroSection = ({ data, siteSettings }: { data: Record<string, unknown>; siteSettings?: Record<string, unknown> }) => {
  const heroData = data as any;
  if (!heroData.enabled) return null;

  const rawFs = heroData.headlineFontSizes || {};
  const toRem = (v: string | undefined, fallback: string) => {
    if (!v) return fallback;
    const s = String(v).trim();
    if (/^[\d.]+$/.test(s)) return s + "rem";
    return s;
  };
  const fs = {
    line1Mobile: toRem(rawFs.line1Mobile, "2.25rem"),
    line2Mobile: toRem(rawFs.line2Mobile, "2.25rem"),
    line3Mobile: toRem(rawFs.line3Mobile, "2.25rem"),
    line1Desktop: toRem(rawFs.line1Desktop, "3.75rem"),
    line2Desktop: toRem(rawFs.line2Desktop, "3.75rem"),
    line3Desktop: toRem(rawFs.line3Desktop, "3.75rem"),
  };
  const hc = heroData.headlineColors || {};
  const alignment = (heroData.heroAlignment as string) || "left";
  const isCentered = alignment === "center";
  const layout = (heroData.heroLayout as string) || "fullscreen";
  const mobileLayout = (heroData.mobileLayout as string) || "fullscreen";
  const isSplit = layout === "split" || layout === "diagonal";
  const mobileNoImage = mobileLayout === "noimage";
  const mobileFullscreen = mobileLayout === "fullscreen" && isSplit;

  return (
    <section id="hero" className={`hero${isCentered ? " hero-centered" : ""}${layout === "split" ? " hero-split" : ""}${layout === "diagonal" ? " hero-diagonal" : ""}${mobileNoImage ? " hero-mobile-noimage" : ""}`} style={heroData.backgroundImageEnabled === false && heroData.backgroundColor ? { backgroundColor: heroData.backgroundColor } : undefined}>
    <style dangerouslySetInnerHTML={{ __html: `
      .hero-line-1 { font-size: ${fs.line1Mobile}; }
      .hero-line-2 { font-size: ${fs.line2Mobile}; }
      .hero-line-3 { font-size: ${fs.line3Mobile}; }
      @media (min-width: 768px) {
        .hero-line-1 { font-size: ${fs.line1Desktop}; }
        .hero-line-2 { font-size: ${fs.line2Desktop}; }
        .hero-line-3 { font-size: ${fs.line3Desktop}; }
      }
    `}} />

    {!isSplit && (
      <div className="hero-bg">
        {heroData.backgroundImageEnabled !== false && (
          <Image src={heroData.image.src} alt={heroData.image.alt} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        )}
        <div className="hero-overlay" style={{ opacity: (heroData.overlayOpacity ?? 5) / 5 }}></div>
      </div>
    )}

    {mobileFullscreen && heroData.backgroundImageEnabled !== false && (
      <div className="hero-bg hero-bg-mobile-fullscreen">
        <Image src={heroData.image.src} alt={heroData.image.alt} fill priority sizes="(max-width: 767px) 100vw, 1px" style={{ objectFit: "cover" }} />
        <div className="hero-overlay" style={{ opacity: (heroData.overlayOpacity ?? 5) / 5 }}></div>
      </div>
    )}

    {heroData.specialBadge?.enabled && heroData.specialBadge?.image && (
    <div className="hero-floats">
      <div className="hero-award">
        <img src={heroData.specialBadge.image} alt={heroData.specialBadge.name || "Special Badge"} className="award-badge-image" />
      </div>
    </div>
    )}

    <div className={`hero-content container${isSplit ? " hero-split-container" : ""}`}>
      <div className="hero-text">
        {heroData.showEyebrow !== false && (
        <div className="eyebrow-wrap">
          <span className="pulse"></span>
          <span className="eyebrow" style={heroData.eyebrowColor ? { color: heroData.eyebrowColor } : undefined}>{heroData.eyebrow}</span>
        </div>
        )}
        <h1 className="hero-headline">
          <span className={`hero-line-1${heroData.wordWrapHeadlines === false ? " hero-nowrap-desktop" : ""}`} style={hc.line1 ? { color: hc.line1 } : undefined}>{heroData.headlineLines[0]}</span>
          {heroData.headlineLines[1] && (<><br /><span className={`hero-line-2${heroData.wordWrapHeadlines === false ? " hero-nowrap-desktop" : ""}`} style={hc.line2 ? { color: hc.line2 } : undefined}>{heroData.headlineLines[1]}</span></>)}
          {heroData.headlineLines[2] && (<><br /><span className={`hero-line-3${heroData.wordWrapHeadlines === false ? " hero-nowrap-desktop" : ""}`} style={hc.line3 ? { color: hc.line3 } : undefined}>{heroData.headlineLines[2]}</span></>)}
        </h1>
        <p className="hero-sub" style={heroData.subheadingColor ? { color: heroData.subheadingColor } : undefined}>{heroData.subheading}</p>
        <div className="hero-ctas">
          <a href={getVoltfloUrl(siteSettings)} className="btn btn-primary" {...externalLinkProps(getVoltfloUrl(siteSettings))}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {heroData.cta[0].label} <span className="arrow">{heroData.ctaArrow}</span>
          </a>
          <a href={getContactFormUrl(siteSettings)} className="btn btn-outline" {...externalLinkProps(getContactFormUrl(siteSettings))}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            </svg>
            {heroData.cta[1].label} <span className="arrow">{heroData.ctaArrow}</span>
          </a>
        </div>
        <div className={`hero-badges${heroData.heroBadges?.showOnMobile !== false ? "" : " hero-badges-hide-mobile"}`}>
          {(heroData.heroBadges?.items || []).filter((b: string) => b.trim()).map((badge: string, i: number) => (
            <span key={i}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {badge}
            </span>
          ))}
        </div>
        {heroData.stats?.enabled !== false && (
        <div className="hero-mobile-stats">
          {(heroData.stats?.items || []).map((stat: any) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        )}
      </div>

      {isSplit && heroData.backgroundImageEnabled !== false && (
        <div className="hero-split-image">
          <Image src={heroData.image.src} alt={heroData.image.alt} fill priority sizes="50vw" style={{ objectFit: "cover" }} />
        </div>
      )}
    </div>

    {!isSplit && (
    <div className="scroll-indicator">
      <span>{heroData.scrollLabel}</span>
      <div className="scroll-mouse">
        <div className="scroll-dot"></div>
      </div>
    </div>
    )}
    </section>
  );
};

export default HeroSection;
