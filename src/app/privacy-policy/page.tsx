import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadPageJson, loadNavFooterData } from "../lib/loadAllHomeData";
import { sanitizeHtml } from "../lib/sanitize";

export const metadata = generatePageMetadata("/privacy-policy");

export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  const pageData = loadPageJson("PrivacyPolicyPage.json") as any;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const { hero, sections, lastUpdated } = pageData;

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/privacy-policy" />
      <PageBanner eyebrow="Legal" title={hero.title} subtitle={hero.subtitle} bannerImage={hero.bannerImage} />

      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <div className="space-y-10">
            {sections.map((section: any, i: number) => (
              <div key={i}>
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{section.title}</h2>
                <div className="leading-relaxed mb-3 rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body || "") + (section.contactEmail ? ` <a href="mailto:${section.contactEmail}">${section.contactEmail}</a> or call <a href="tel:${section.contactPhone?.replace(/\s/g, "")}">${section.contactPhone}</a>.` : "") }} />
                {section.bullets && (
                  <ul className="space-y-2" style={{ color: "var(--text-secondary)" }}>
                    {section.bullets.map((bullet: string, j: number) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-brand mt-1">•</span> {bullet}
                      </li>
                    ))}
                  </ul>
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
