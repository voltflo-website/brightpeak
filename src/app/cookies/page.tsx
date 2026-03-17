import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/cookies");

export const revalidate = 60;

export default function CookiesPage() {
  const pageData = loadPageJson("CookiesPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, sections, lastUpdated } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/cookies" />
      <PageBanner title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <div className="space-y-8">
            {sections.map((section: any, i: number) => (
              <div key={i}>
                <h2 className="text-2xl font-extrabold mb-4">{section.title}</h2>
                <div className="leading-relaxed mb-4 rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body || "") + (section.contactEmail ? ` <a href="mailto:${section.contactEmail}">${section.contactEmail}</a> or call <a href="tel:${section.contactPhone?.replace(/\s/g, "")}">${section.contactPhone}</a>.` : "") }} />
                {section.cookieTypes && (
                  <div className="space-y-4">
                    {section.cookieTypes.map((cookie: any) => (
                      <div
                        key={cookie.title}
                        className="p-6 rounded-xl border"
                        style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{cookie.title}</h3>
                          {cookie.required && (
                            <span
                              className="text-xs font-semibold px-3 py-1 rounded-full"
                              style={{ background: "#e0f2fe", color: "#0284c7" }}
                            >
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-sm leading-relaxed rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(cookie.desc || "") }} />
                      </div>
                    ))}
                  </div>
                )}
                {section.bullets && (
                  <>
                    <ul className="space-y-2" style={{ color: "var(--text-secondary)" }}>
                      {section.bullets.map((bullet: string, j: number) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-brand mt-1">•</span> {bullet}
                        </li>
                      ))}
                    </ul>
                    {section.afterBullets && (
                      <p className="leading-relaxed mt-3" style={{ color: "var(--text-secondary)" }}>
                        {section.afterBullets}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}

            <div
              className="p-6 rounded-xl mt-8"
              style={{ background: "var(--bg-secondary)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
