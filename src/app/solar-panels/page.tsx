import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/solar-panels");

export const dynamic = "force-dynamic";

export default function SolarPanelsPage() {
  const pageData = loadPageJson("SolarPanelsPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, whySolar, process, included, cta } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="service" pagePath="/solar-panels" serviceName="Solar Panel Installation" />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      {whySolar?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">
              {whySolar.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold">{whySolar.title}</h2>
          </div>
          <div className={`solar-cards-grid${(whySolar.cards || []).length > 3 ? " solar-cards-grid-2col" : ""}`}>
            {(whySolar.cards || []).map((card: any, i: number) => (
              <div key={i} className="solar-info-card">
                <div className="solar-info-card-text">
                  <h3 className="font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>{card.subHeading}</h3>
                  <div className="leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.paragraph || "") }} />
                </div>
                {card.image && (
                  <div className="solar-info-card-image">
                    <img
                      src={card.image}
                      alt={card.subHeading}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {whySolar.bullets && whySolar.bullets.length > 0 && (
            <ul className="solar-bullets">
              {whySolar.bullets.map((item: string) => (
                <li key={item}>
                  <span className="text-brand font-bold">&#10003;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      )}

      {process?.enabled !== false && (
      <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">
              {process.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold">{process.title}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {process.steps.map((item: any) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4"
                  style={{ background: "var(--teal)" }}
                >
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <div className="text-sm rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {included?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">{included.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {included.items.map((item: any) => (
              <div
                key={item.title}
                className="p-6 rounded-xl shadow-sm border text-center"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <div className="text-sm rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {cta?.enabled !== false && (
      <section
        style={{
          background: "linear-gradient(135deg, var(--brand-banner-overlay) 0%, color-mix(in srgb, var(--brand-banner-overlay) 80%, #334155) 50%, var(--brand-banner-overlay) 100%)",
          color: "#fff",
          padding: "4rem 0",
        }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            {cta.title}
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            {cta.subtitle}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={getUrlForVariant(cta.primaryButton?.variant || "primary", siteSettings)}
              {...externalLinkProps(getUrlForVariant(cta.primaryButton?.variant || "primary", siteSettings))}
              className="btn btn-primary"
            >
              {heroCta.label}
            </a>
            {cta.secondaryButton && (
              <a
                href={getUrlForVariant(cta.secondaryButton.variant || "secondary", siteSettings)}
                {...externalLinkProps(getUrlForVariant(cta.secondaryButton.variant || "secondary", siteSettings))}
                className="btn btn-outline"
              >
                {cta.secondaryButton.label}
              </a>
            )}
          </div>
        </div>
      </section>
      )}
    </PageLayout>
  );
}
