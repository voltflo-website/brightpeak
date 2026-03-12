import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/heat-pumps");

export const dynamic = "force-dynamic";

export default function HeatPumpsPage() {
  const pageData = loadPageJson("HeatPumpsPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, intro, pumpTypes, exhaustAir, geothermal, newBuild, retrofit, benefits, cta } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="service" pagePath="/heat-pumps" serviceName="Heat Pump Installation" />
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

      {pumpTypes?.enabled !== false && pumpTypes && (
        <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold">{pumpTypes.title}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(pumpTypes.items || []).map((item: any, i: number) => (
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

      {exhaustAir?.enabled !== false && exhaustAir && (
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="text-center mb-12">
              <p className="page-eyebrow">{exhaustAir.eyebrow}</p>
              <h2 className="text-3xl font-extrabold">{exhaustAir.title}</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              {exhaustAir.image && (
                <img
                  src={exhaustAir.image}
                  alt={exhaustAir.imageAlt || ""}
                  loading="lazy"
                  className="ufh-intro-image"
                />
              )}
              {(exhaustAir.paragraphs || []).map((p: string, i: number) => (
                <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {geothermal?.enabled !== false && geothermal && (
        <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
          <div className="container">
            <div className="text-center mb-12">
              <p className="page-eyebrow">{geothermal.eyebrow}</p>
              <h2 className="text-3xl font-extrabold">{geothermal.title}</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              {geothermal.image && (
                <img
                  src={geothermal.image}
                  alt={geothermal.imageAlt || ""}
                  loading="lazy"
                  className="ufh-intro-image"
                />
              )}
              {(geothermal.paragraphs || []).map((p: string, i: number) => (
                <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {newBuild?.enabled !== false && newBuild && (
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="text-center mb-12">
              <p className="page-eyebrow">{newBuild.eyebrow}</p>
              <h2 className="text-3xl font-extrabold">{newBuild.title}</h2>
            </div>
            <div className="max-w-4xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {(newBuild.paragraphs || []).map((p: string, i: number) => (
                <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {retrofit?.enabled !== false && retrofit && (
        <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
          <div className="container">
            <div className="text-center mb-12">
              <p className="page-eyebrow">{retrofit.eyebrow}</p>
              <h2 className="text-3xl font-extrabold">{retrofit.title}</h2>
            </div>
            <div className="max-w-4xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {(retrofit.paragraphs || []).map((p: string, i: number) => (
                <div key={i} className="leading-relaxed text-base rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {benefits?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">{benefits.eyebrow}</p>
            <h2 className="text-3xl font-extrabold">{benefits.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
