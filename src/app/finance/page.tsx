import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";

export const metadata = generatePageMetadata("/finance");

export const revalidate = 60;

export default function FinancePage() {
  const pageData = loadPageJson("FinancePage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, partnership, howItWorks, cta } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/finance" />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      {partnership?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="page-eyebrow">
                {partnership.eyebrow}
              </p>
              <h2 className="text-3xl font-extrabold mb-6">
                {partnership.title}
              </h2>
              {partnership.paragraphs.map((text: string, i: number) => (
                <div key={i} className={`leading-relaxed rich-html${i < partnership.paragraphs.length - 1 ? " mb-4" : ""}`} style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(text || "") }} />
              ))}
            </div>
            <div className="space-y-6">
              {partnership.features.map((item: any) => (
                <div
                  key={item.title}
                  className="flex gap-4 p-6 rounded-xl shadow-sm border"
                  style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <div className="text-sm rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {howItWorks?.enabled !== false && (
      <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">{howItWorks.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.steps.map((item: any) => (
              <div key={item.step} className="text-center p-8 rounded-2xl shadow-sm" style={{ background: "var(--bg-primary)" }}>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
                  style={{ background: "var(--teal)" }}
                >
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <div className="rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
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
