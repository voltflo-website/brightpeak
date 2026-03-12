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

export const dynamic = "force-dynamic";

function loadCaseStudies() {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/home/CaseStudiesSection.json"),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return { cards: [] };
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
  const data = loadCaseStudies();
  return (data.cards || []).map((card: any) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = loadCaseStudies();
  const card = (data.cards || []).find((c: any) => c.slug === slug);
  const seoData = loadSeoData();

  if (!card) {
    return { title: "Project Not Found" };
  }

  const title = `${card.title} | Our Work | ${seoData.siteName || "BrightPeak Energy"}`;
  const description = (card.description || "").replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `${seoData.siteUrl}/our-work/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${seoData.siteUrl}/our-work/${slug}`,
      siteName: seoData.siteName,
      images: [
        {
          url: `${seoData.siteUrl}${card.image?.src || ""}`,
          width: 1200,
          height: 630,
          alt: card.title,
        },
      ],
      type: "article",
    },
  };
}

function getEmbedUrl(url: string): string | null {
  if (!url || !url.trim()) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/shorts/")[1]?.split(/[/?]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split(/[/?]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "www.youtube.com" && u.pathname.startsWith("/embed/")) {
      return url;
    }
    if (u.hostname === "player.vimeo.com") return url;
    if (u.hostname === "vimeo.com") {
      const id = u.pathname.slice(1).split(/[/?]/)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const data = loadCaseStudies();
  const cards = data.cards || [];
  const card = cards.find((c: any) => c.slug === slug);

  if (!card) {
    notFound();
  }

  const seoData = loadSeoData();
  const embedUrl = getEmbedUrl(card.video || "");
  const allImages = (card.images || []).filter((s: string) => s && s.trim() !== "");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: card.title,
    description: (card.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    image: allImages.length > 0
      ? allImages.map((img: string) => `${seoData.siteUrl}${img}`)
      : card.image?.src ? [`${seoData.siteUrl}${card.image.src}`] : [],
    url: `${seoData.siteUrl}/our-work/${slug}`,
    publisher: {
      "@type": "Organization",
      name: seoData.business?.name || "BrightPeak Energy",
      logo: {
        "@type": "ImageObject",
        url: `${seoData.siteUrl}${seoData.business?.logo || "/images/company-logo.png"}`,
      },
    },
  };

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath={`/our-work/${slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PageBanner
        eyebrow={card.sub}
        title={card.title}
        bannerImage={card.image?.src}
      />

      <section className="py-16 md:py-20">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="mb-4">
            <Link
              href="/our-work"
              className="text-sm font-semibold inline-flex items-center gap-1"
              style={{ color: "var(--teal)" }}
            >
              ← Back to All Projects
            </Link>
          </div>

          {card.stats && card.stats.length > 0 && (
            <div
              className="flex flex-wrap gap-8 justify-center p-6 rounded-xl mb-10"
              style={{ background: "var(--bg-secondary)" }}
            >
              {card.stats.map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <strong className="block text-2xl font-bold" style={{ color: "var(--teal)" }}>{stat.value}</strong>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {embedUrl && (
            <div className="mb-10 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={embedUrl}
                title={card.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          )}

          {allImages.length > 0 && (
            <div className={`grid gap-4 mb-10 ${allImages.length === 1 ? "" : "md:grid-cols-2"}`}>
              {allImages.map((img: string, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <img
                    src={img}
                    alt={i === 0 ? card.image?.alt || card.title : `${card.title} - Image ${i + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: "16/10" }}
                  />
                </div>
              ))}
            </div>
          )}

          <div
            className="prose max-w-none rich-html text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.description || "") }}
          />

          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--gray-200)" }}>
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <Link
                href="/our-work"
                className="text-sm font-semibold inline-flex items-center gap-1"
                style={{ color: "var(--teal)" }}
              >
                ← All Projects
              </Link>
              <a
                href="/contact"
                className="btn btn-primary"
              >
                Get a Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
