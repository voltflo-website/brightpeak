import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/about");

export const dynamic = "force-dynamic";

export default function AboutPage() {
  const aboutData = loadPageJson("AboutPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="about" pagePath="/about" />
      <PageBanner eyebrow={aboutData.hero.eyebrow} title={aboutData.hero.title} subtitle={aboutData.hero.description} bannerImage={aboutData.hero.bannerImage} />

      {aboutData.story?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="page-eyebrow">
                {aboutData.story.eyebrow}
              </p>
              <h2 className="text-3xl font-extrabold mb-6">
                {aboutData.story.title}
              </h2>
              {aboutData.story.paragraphs.map((p: string, i: number) => (
                <div key={i} className={`leading-relaxed rich-html ${i < aboutData.story.paragraphs.length - 1 ? "mb-4" : ""}`} style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p || "") }} />
              ))}
            </div>
            <div className="relative">
              <img
                src={aboutData.story.image.src}
                alt={aboutData.story.image.alt}
                className="rounded-2xl shadow-lg w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {aboutData.values?.enabled !== false && (
      <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">
              {aboutData.values.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold">{aboutData.values.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {aboutData.values.items.map((item: any) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-md text-center"
                style={{ background: "var(--bg-primary)" }}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <div className="rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.desc || "") }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {aboutData.credentials?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">
              {aboutData.credentials.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold">{aboutData.credentials.title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aboutData.credentials.items.map((cert: any) => (
              <div
                key={cert.label}
                className="rounded-xl p-6 text-center shadow-sm border"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                <div className="text-3xl mb-3">{cert.icon}</div>
                <p className="font-semibold text-sm">{cert.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {aboutData.cta?.enabled !== false && (
      <section
        style={{
          background: "linear-gradient(135deg, var(--brand-banner-overlay) 0%, color-mix(in srgb, var(--brand-banner-overlay) 80%, #334155) 50%, var(--brand-banner-overlay) 100%)",
          color: "#fff",
          padding: "4rem 0",
        }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            {aboutData.cta.title}
          </h2>
          <div className="text-lg mb-8 opacity-90 max-w-xl mx-auto rich-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(aboutData.cta.description || "") }} />
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={getUrlForVariant(aboutData.cta.primaryButton?.variant || "primary", siteSettings)}
              {...externalLinkProps(getUrlForVariant(aboutData.cta.primaryButton?.variant || "primary", siteSettings))}
              className="btn btn-primary"
            >
              {heroCta.label}
            </a>
            <a
              href={getUrlForVariant(aboutData.cta.secondaryButton?.variant || "secondary", siteSettings)}
              {...externalLinkProps(getUrlForVariant(aboutData.cta.secondaryButton?.variant || "secondary", siteSettings))}
              className="btn btn-outline"
            >
              {aboutData.cta.secondaryButton.label}
            </a>
          </div>
        </div>
      </section>
      )}
    </PageLayout>
  );
}
