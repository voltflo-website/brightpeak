import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { sanitizeHtml } from "../lib/sanitize";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata = generatePageMetadata("/solar-guide");

export const dynamic = "force-dynamic";

function loadFaqData() {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/home/FaqSection.json"),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return { categories: [], items: [] };
  }
}

export default function FaqPage() {
  const faqData = loadFaqData();
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();

  const categories = (faqData.categories || []) as {
    slug: string;
    title: string;
    description: string;
  }[];

  const items = (faqData.items || []) as {
    question: string;
    answer: string;
    category: string;
  }[];

  const activeSlugs = new Set(categories.map((c) => c.slug));
  const activeItems = items.filter((item) => activeSlugs.has(item.category) && item.category !== "_orphan");

  const itemsByCategory = new Map<string, typeof items>();
  for (const item of activeItems) {
    const list = itemsByCategory.get(item.category) || [];
    list.push(item);
    itemsByCategory.set(item.category, list);
  }

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="faq" pagePath="/solar-guide" faqItems={activeItems} />
      <PageBanner
        eyebrow={faqData.eyebrow || "Solar Guide"}
        title={faqData.title || "Your Solar Guide"}
        subtitle={faqData.subtitle || "Find answers to common questions about our services"}
        bannerImage={faqData.bannerImage}
      />

      <section className="py-16 md:py-20">
        <div className="container" style={{ maxWidth: faqData.faqStyle === "list" ? "900px" : "1200px" }}>
          {faqData.faqStyle === "list" ? (
            <>
              {categories.map((cat) => {
                const catItems = itemsByCategory.get(cat.slug) || [];
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.slug} className="mb-10">
                    <h2
                      className="text-lg font-bold mb-4 text-center"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {cat.title}
                    </h2>
                    <div className="faq-list">
                      {catItems.map((item, index) => (
                        <details key={index} className="faq-item">
                          <summary>{item.question}</summary>
                          <div
                            className="faq-answer"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.answer) }}
                          />
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const catItems = itemsByCategory.get(cat.slug) || [];
                return (
                  <Link
                    key={cat.slug}
                    href={`/solar-guide/${cat.slug}`}
                    className="solar-guide-card group"
                  >
                    <div className="solar-guide-card-banner">
                      <h2 className="solar-guide-card-banner-title">{cat.title}</h2>
                    </div>
                    <div className="solar-guide-card-body">
                      <p className="solar-guide-card-desc">{cat.description}</p>
                      <div className="solar-guide-card-footer">
                        <span className="solar-guide-card-count">{catItems.length} questions</span>
                        <span className="solar-guide-card-arrow">Explore →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
