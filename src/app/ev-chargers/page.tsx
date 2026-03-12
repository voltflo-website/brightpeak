import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/ev-chargers");

export const dynamic = "force-dynamic";

export default function EvChargersPage() {
  const pageData = loadPageJson("EvChargersPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, section1, section2, features, business, cta } = pageData;
  const featureItems = Array.isArray(features) ? features : (features?.items || []);

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="service" pagePath="/ev-chargers" serviceName="EV Charger Installation" />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      {section1?.enabled !== false && (
      <section className="py-12 md:py-20">
        <div className="container">
          <p className="page-eyebrow">
            {section1.eyebrow}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">
            {section1.title1}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div>
              <div className="mb-5">
                {section1.subHeading && <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>{section1.subHeading}</h3>}
                <div className="leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(section1.paragraph || "") }} />
              </div>
              {section1.image && (
                <div className="rounded-xl overflow-hidden" style={{ width: "100%", maxWidth: "320px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={section1.image}
                    alt={section1.imageAlt}
                    className="w-full"
                    style={{ objectFit: "contain", objectPosition: "center" }}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
            {features?.enabled !== false && featureItems.length > 0 && <div className="space-y-4 md:space-y-6">
              {featureItems.map((item: any) => (
                <div
                  key={item.title}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 rounded-xl shadow-sm border"
                  style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
                >
                  <div className="text-2xl md:text-3xl flex-shrink-0">{item.icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1">{item.title}</h3>
                    <div className="text-sm rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
                  </div>
                </div>
              ))}
            </div>}
          </div>
        </div>
      </section>
      )}

      {section2?.enabled !== false && (
      <section className="py-12 md:py-20">
        <div className="container">
          <h2 className="text-xl md:text-2xl font-extrabold mb-6" style={{ color: "var(--text-primary)" }}>
            {section2.title2}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div>
              {section2.subHeading && <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>{section2.subHeading}</h3>}
              <div className="leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(section2.paragraph || "") }} />
            </div>
            <div className="flex justify-center">
              <img
                src={section2.image}
                alt={section2.imageAlt || "EV Charger"}
                className="rounded-xl"
                style={{ maxWidth: "220px", width: "100%" }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {business?.enabled !== false && (
      <section className="py-12 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold">{business.title}</h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>{business.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {business.items.map((item: any) => (
              <div
                key={item.title}
                className="p-5 md:p-6 rounded-xl shadow-sm text-center"
                style={{ background: "var(--bg-primary)" }}
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
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            {cta.title}
          </h2>
          <p className="text-base md:text-lg mb-8 opacity-90 max-w-xl mx-auto">
            {cta.subtitle}
          </p>
          <a
            href={getUrlForVariant(cta.primaryButton?.variant || "primary", siteSettings)}
            {...externalLinkProps(getUrlForVariant(cta.primaryButton?.variant || "primary", siteSettings))}
            className="btn btn-primary"
          >
            {heroCta.label}
          </a>
        </div>
      </section>
      )}
    </PageLayout>
  );
}
