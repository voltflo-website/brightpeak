import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/funding-options");

export const dynamic = "force-dynamic";

export default function FundingOptionsPage() {
  const pageData = loadPageJson("FundingOptionsPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, fundingSchemes, helpSection, cta } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/funding-options" />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      {fundingSchemes?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">{fundingSchemes.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {fundingSchemes.items.map((item: any) => (
              <div
                key={item.title}
                className="p-8 rounded-2xl shadow-md border"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <div className="leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {helpSection?.enabled !== false && (
      <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold mb-6">
                {helpSection.title}
              </h2>
              {helpSection.paragraphs.map((paragraph: string, i: number) => (
                <div key={i} className="mb-4 leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph || "") }} />
              ))}
              <a
                href={getUrlForVariant(helpSection.button?.variant || "secondary", siteSettings)}
                {...externalLinkProps(getUrlForVariant(helpSection.button?.variant || "secondary", siteSettings))}
                className="btn btn-outline inline-block mt-4"
              >
                {helpSection.button.label}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {helpSection.stats.map((stat: any) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-xl text-center"
                  style={{ background: "var(--bg-primary)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="text-2xl font-extrabold mb-1 text-brand">{stat.value}</div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
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
