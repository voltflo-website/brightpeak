import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/underfloor-heating");

export const dynamic = "force-dynamic";

export default function UnderfloorHeatingPage() {
  const pageData = loadPageJson("UnderfloorHeatingPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, intro, floorTypes, variotherm, servicing, benefits, cta } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="service" pagePath="/underfloor-heating" serviceName="Underfloor Heating Installation" />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      {intro?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">{intro.eyebrow}</p>
            <h2 className="text-3xl font-extrabold">{intro.title}</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            {intro.image && (
              <img
                src={intro.image}
                alt={intro.imageAlt || ""}
                loading="lazy"
                className="ufh-intro-image"
              />
            )}
            {(intro.paragraphs || []).map((p: string, i: number) => (
              <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
            ))}
          </div>
        </div>
      </section>
      )}

      {floorTypes?.enabled !== false && floorTypes && (
        <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold">{floorTypes.title}</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {(floorTypes.items || []).map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-xl shadow-sm border text-center"
                  style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {variotherm?.enabled !== false && variotherm && (
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="text-center mb-12">
              <p className="page-eyebrow">{variotherm.eyebrow}</p>
              <h2 className="text-3xl font-extrabold">{variotherm.title}</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              {variotherm.image && (
                <img
                  src={variotherm.image}
                  alt={variotherm.imageAlt || ""}
                  loading="lazy"
                  className="ufh-intro-image"
                />
              )}
              {(variotherm.paragraphs || []).map((p: string, i: number) => (
                <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {benefits?.enabled !== false && (
      <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">{benefits.eyebrow}</p>
            <h2 className="text-3xl font-extrabold">{benefits.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(benefits.items || []).map((item: any, i: number) => (
              <div
                key={i}
                className="p-6 rounded-xl shadow-sm border"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                <div className="text-sm leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {servicing?.enabled !== false && servicing && (
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="text-center mb-12">
              <p className="page-eyebrow">{servicing.eyebrow}</p>
              <h2 className="text-3xl font-extrabold">{servicing.title}</h2>
            </div>
            <div className="max-w-4xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {(servicing.paragraphs || []).map((p: string, i: number) => (
                <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
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
