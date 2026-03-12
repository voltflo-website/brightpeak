import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { NewsPageCard } from "../components/home/NewsVideoPageCard";
import NewsVideosScrollRow from "../components/home/NewsVideosScrollRow";
import fs from "fs";
import path from "path";
import Link from "next/link";

export const metadata = generatePageMetadata("/news");

export const dynamic = "force-dynamic";

function loadNewsData(): any {
  try {
    const filePath = path.join(process.cwd(), "data/home/NewsVideosSection.json");
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return { sectionTitle: "News", newsItems: [], defaultThumbnail: "" };
  }
}

export default function NewsIndexPage() {
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const nvData = loadNewsData();
  const newsItems = (nvData.newsItems || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/news" />

      <PageBanner eyebrow="Latest Updates" title="News" subtitle="Stay up to date with the latest solar energy news, project updates, and helpful articles from our team." bannerImage={nvData.bannerImage} />

      <section style={{ padding: "4rem 0", background: "var(--bg-primary)" }}>
        <div className="container">
          {newsItems.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              No news articles yet. Check back soon!
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "2rem" }}>
              {newsItems.map((item: any, i: number) => (
                <Link key={`news-${i}`} href={`/news/${item.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="nv-page-card" style={{ cursor: "pointer", height: "100%" }}>
                    <div className="nv-card-news-bar">
                      <span className="nv-badge nv-badge-news">📰 News</span>
                    </div>
                    <div className="nv-page-card-body">
                      <span className="nv-date">
                        {(() => {
                          try {
                            const d = new Date(item.date + "T00:00:00");
                            return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
                          } catch {
                            return item.date;
                          }
                        })()}
                      </span>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--text-primary)" }}>
                        {item.title}
                      </h2>
                      {item.summary && (
                        <div style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: item.summary.replace(/<[^>]*>/g, '').slice(0, 160) + (item.summary.replace(/<[^>]*>/g, '').length > 160 ? '...' : '') }} />
                      )}
                      <span style={{ display: "inline-block", marginTop: "1rem", color: "var(--accent)", fontWeight: 600, fontSize: "0.95rem" }}>
                        Read Full Article →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
