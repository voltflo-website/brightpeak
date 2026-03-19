import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/commercial-solar");

export const revalidate = 60;

export default function CommercialSolarPage() {
  const pageData = loadPageJson("CommercialSolarPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, about, whyChoose, trusted, cta } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="service" pagePath="/commercial-solar" serviceName={hero.title} />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      {about?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="page-eyebrow">
                {about.eyebrow}
              </p>
              <h2 className="text-3xl font-extrabold mb-6">
                {about.title}
              </h2>
              {about.paragraphs.map((text: string, i: number) => (
                <div key={i} className={`leading-relaxed rich-html${i < about.paragraphs.length - 1 ? " mb-4" : ""}`} style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(text || "") }} />
              ))}
            </div>
            <div>
              <img
                src={about.image.src}
                alt={about.image.alt}
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {whyChoose?.enabled !== false && (
      <section className="py-16 md:py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">{whyChoose.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {whyChoose.items.map((item: any) => (
              <div
                key={item.title}
                className="p-6 rounded-xl shadow-sm text-center"
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

      {trusted?.enabled !== false && (
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">{trusted.title}</h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>{trusted.subtitle}</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-60">
            {trusted.logos.map((src: string) => (
              <img key={src} src={src} alt="Client logo" className="mx-auto h-12 object-contain" />
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
            className="btn btn-outline"
          >
            {heroCta.label}
          </a>
        </div>
      </section>
      )}
    </PageLayout>
  );
}
