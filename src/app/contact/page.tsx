import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import ContactForm from "../components/ContactForm";
import { getUrlForVariant, externalLinkProps } from "../lib/siteSettings";
import { sanitizeHtml } from "../lib/sanitize";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";

export const metadata = generatePageMetadata("/contact");

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const pageData = loadPageJson("ContactPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, form, contactInfo, certifications, quickQuote } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="contact" pagePath="/contact" />
      <PageBanner eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {form?.enabled !== false && (
            <ContactForm
              title={form.title}
              fields={form.fields}
              serviceSelect={form.serviceSelect}
              messageField={form.message}
              submitButton={form.submitButton}
            />
            )}

            <div className="space-y-8">
              {contactInfo?.enabled !== false && (
              <div>
                <h2 className="text-3xl font-extrabold mb-8">{contactInfo.title}</h2>
                <div className="space-y-6">
                  {contactInfo.items.map((item: any) => (
                    <div key={item.title} className="flex gap-4 items-start">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: "#e0f2fe" }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{item.title}</h3>
                        {item.href ? (
                          <a href={item.href} className="text-brand hover:underline">
                            {item.content}
                          </a>
                        ) : (
                          <p style={{ color: "var(--text-secondary)" }}>{item.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {certifications?.enabled !== false && (
              <div
                className="p-6 rounded-2xl"
                style={{ background: "var(--bg-secondary)" }}
              >
                <h3 className="font-bold text-lg mb-3">{certifications.title}</h3>
                <ul className="space-y-2">
                  {certifications.items.map((cert: string) => (
                    <li key={cert} className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                      <span className="text-brand">&#10003;</span> {cert}
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {quickQuote?.enabled !== false && (
              <div
                className="p-6 rounded-2xl"
                style={{ background: "#e0f2fe" }}
              >
                <h3 className="font-bold text-lg mb-2">{quickQuote.title}</h3>
                <div className="mb-4 rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(quickQuote.description || "") }} />
                <a
                  href={getUrlForVariant("primary", siteSettings)}
                  {...externalLinkProps(getUrlForVariant("primary", siteSettings))}
                  className="btn btn-primary inline-block"
                >
                  {quickQuote.buttonLabel}
                </a>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
