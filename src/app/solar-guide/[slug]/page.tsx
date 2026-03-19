import PageLayout from "../../components/PageLayout";
import PageBanner from "../../components/PageBanner";
import { loadNavFooterData } from "../../lib/loadAllHomeData";
import StructuredData from "../../components/StructuredData";
import { sanitizeHtml } from "../../lib/sanitize";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

export const revalidate = 60;

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

function loadSeoData(): any {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/seo.json"),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return { siteUrl: "", siteName: "" };
  }
}

export async function generateStaticParams() {
  const data = loadFaqData();
  return (data.categories || []).map((cat: any) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = loadFaqData();
  const cat = (data.categories || []).find((c: any) => c.slug === slug);
  const seoData = loadSeoData();

  if (!cat) {
    return { title: "Solar Guide — Not Found" };
  }

  const title = `${cat.title} — Solar Guide | ${seoData.siteName || "BrightPeak Energy"}`;
  const description = cat.description || `Frequently asked questions about ${cat.title.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${seoData.siteUrl}/solar-guide/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${seoData.siteUrl}/solar-guide/${slug}`,
      siteName: seoData.siteName,
      type: "website",
    },
  };
}

export default async function FaqCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const data = loadFaqData();
  const categories = data.categories || [];
  const allItems = data.items || [];
  const cat = categories.find((c: any) => c.slug === slug);

  if (!cat) {
    notFound();
  }

  const seoData = loadSeoData();
  const items = allItems.filter((item: any) => item.category === slug);

  const itemsByCategory = new Map<string, number>();
  for (const item of allItems) {
    if (item.category !== "_orphan") {
      itemsByCategory.set(item.category, (itemsByCategory.get(item.category) || 0) + 1);
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item: any) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: (item.answer || "").replace(/<[^>]*>/g, ""),
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: seoData.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Solar Guide",
        item: `${seoData.siteUrl}/solar-guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cat.title,
        item: `${seoData.siteUrl}/solar-guide/${slug}`,
      },
    ],
  };

  const otherCategories = categories.filter((c: any) => c.slug !== slug);

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath={`/solar-guide/${slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageBanner
        eyebrow="Solar Guide"
        title={cat.title}
        subtitle={cat.description}
        bannerImage={data.bannerImage}
      />

      <section className="py-16 md:py-20">
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="mb-6">
            <Link
              href="/solar-guide"
              className="font-semibold inline-flex items-center gap-1"
              style={{ color: "var(--brand-primary)", fontSize: "1rem" }}
            >
              ← All Solar Guide Topics
            </Link>
          </div>

          <div className="faq-list mb-12">
            {items.map((item: any, index: number) => (
              <details key={index} className="faq-item" open={index === 0}>
                <summary>{item.question}</summary>
                <div
                  className="faq-answer"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.answer) }}
                />
              </details>
            ))}
          </div>

          <div
            className="rounded-xl p-8 mb-12 text-center"
            style={{ background: "var(--brand-primary)", color: "#fff" }}
          >
            <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
            <p className="mb-6 opacity-90">
              Our team is happy to help. Get in touch for a free, no-obligation consultation.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#fff", color: "var(--brand-primary)" }}
            >
              Contact Us
            </a>
          </div>

          {otherCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Other Solar Guide Topics
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherCategories.map((other: any) => (
                  <Link
                    key={other.slug}
                    href={`/solar-guide/${other.slug}`}
                    className="solar-guide-card"
                  >
                    <div className="solar-guide-card-banner">
                      <h3 className="solar-guide-card-banner-title">{other.title}</h3>
                    </div>
                    <div className="solar-guide-card-body">
                      <div className="solar-guide-card-footer">
                        <span className="solar-guide-card-count">{itemsByCategory.get(other.slug) || 0} questions</span>
                        <span className="solar-guide-card-arrow">Explore →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--gray-200)" }}>
            <Link
              href="/solar-guide"
              className="text-sm font-semibold inline-flex items-center gap-1"
              style={{ color: "var(--teal)" }}
            >
              ← All Solar Guide Topics
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
