interface PageBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
}

export default function PageBanner({ eyebrow, title, subtitle, bannerImage }: PageBannerProps) {
  return (
    <section className="page-banner">
      {bannerImage && (
        <div
          className="page-banner-bg"
          style={{ backgroundImage: `url(${bannerImage})` }}
        />
      )}
      <div className="page-banner-overlay" />
      <div className="container text-center" style={{ position: "relative", zIndex: 2 }}>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-widest mb-4 opacity-80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-xl max-w-2xl mx-auto opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
