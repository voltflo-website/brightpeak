import PageLayout from "../../components/PageLayout";
import PageBanner from "../../components/PageBanner";
import { loadNavFooterData } from "../../lib/loadAllHomeData";
import { sanitizeHtml } from "../../lib/sanitize";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function loadNewsData(): any {
  try {
    const filePath = path.join(process.cwd(), "data/home/NewsVideosSection.json");
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return { newsItems: [], defaultThumbnail: "" };
  }
}

function loadSeoData(): any {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), "data/seo.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return { siteUrl: "", siteName: "", defaultImage: "" };
  }
}

function findNewsItem(slug: string) {
  const data = loadNewsData();
  const items = data.newsItems || [];
  return items.find((item: any) => item.slug === slug) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = findNewsItem(slug);
  if (!item) return { title: "Article Not Found" };

  const seoData = loadSeoData();
  const plainSummary = (item.summary || "").replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${item.title} | ${seoData.siteName || "BrightPeak Energy"}`,
    description: plainSummary || item.title,
    alternates: {
      canonical: `${seoData.siteUrl}/news/${slug}`,
    },
    openGraph: {
      title: item.title,
      description: plainSummary || item.title,
      url: `${seoData.siteUrl}/news/${slug}`,
      siteName: seoData.siteName,
      type: "article",
      publishedTime: item.date,
      images: [
        {
          url: `${seoData.siteUrl}${seoData.defaultImage || "/images/hero/hero-solar-panels.webp"}`,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: plainSummary || item.title,
    },
  };
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, "");
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findNewsItem(slug);
  if (!item) notFound();

  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const nvData = loadNewsData();
  const seoData = loadSeoData();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: stripHtml(item.summary).slice(0, 160),
    datePublished: item.date,
    dateModified: item.date,
    author: {
      "@type": "Organization",
      name: seoData.business?.name || "BrightPeak Energy",
      url: seoData.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: seoData.business?.name || "BrightPeak Energy",
      logo: {
        "@type": "ImageObject",
        url: `${seoData.siteUrl}${seoData.business?.logo || "/images/company-logo.png"}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${seoData.siteUrl}/news/${slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: seoData.siteUrl },
      { "@type": "ListItem", position: 2, name: "News", item: `${seoData.siteUrl}/news` },
      { "@type": "ListItem", position: 3, name: item.title, item: `${seoData.siteUrl}/news/${slug}` },
    ],
  };

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <PageBanner eyebrow="News" title={item.title} subtitle={formatDate(item.date)} bannerImage={nvData.bannerImage} />

      <article style={{ padding: "4rem 0", background: "var(--bg-primary)" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <Link href="/news" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}>
              ← Back to News
            </Link>
          </div>

          {item.summary && (
            <div style={{
              fontSize: "1.15rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              fontStyle: "italic",
              marginBottom: "2rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid var(--border-color, #e5e7eb)",
            }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.summary) }} />
          )}

          {item.content && (
            <div className="nv-rich-content" style={{
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "var(--text-primary)",
            }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
          )}

          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color, #e5e7eb)", textAlign: "center" }}>
            <Link href="/news" style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1rem",
            }}>
              ← View All News
            </Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
