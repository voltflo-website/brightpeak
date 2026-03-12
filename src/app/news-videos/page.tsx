import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import { VideoPageCard, NewsPageCard } from "../components/home/NewsVideoPageCard";
import NewsVideosScrollRow from "../components/home/NewsVideosScrollRow";
import fs from "fs";
import path from "path";

export const metadata = generatePageMetadata("/news-videos");

export const dynamic = "force-dynamic";

function loadNewsVideosData(): any {
  try {
    const filePath = path.join(process.cwd(), "data/home/NewsVideosSection.json");
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return { sectionTitle: "News & Videos", newsItems: [], videoItems: [], defaultThumbnail: "" };
  }
}

export default function NewsVideosPage() {
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const nvData = loadNewsVideosData();
  const newsItems = (nvData.newsItems || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const videoItems = (nvData.videoItems || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/news-videos" />

      <PageBanner eyebrow={nvData.eyebrow || "Latest Updates"} title={nvData.sectionTitle || "News & Videos"} subtitle={nvData.subtitle || ""} bannerImage={nvData.bannerImage} />

      <section style={{ padding: "4rem 0", background: "var(--bg-primary)" }}>
        <div className="container">
          {videoItems.length === 0 && newsItems.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              No news or videos yet. Check back soon!
            </p>
          ) : (
            <>
              {newsItems.length > 0 && (
                <NewsVideosScrollRow label="News / Blogs" itemCount={newsItems.length}>
                  {newsItems.map((item: any, i: number) => (
                    <NewsPageCard key={`news-${i}`} item={item} />
                  ))}
                </NewsVideosScrollRow>
              )}

              {videoItems.length > 0 && (
                <NewsVideosScrollRow label="Videos" itemCount={videoItems.length}>
                  {videoItems.map((item: any, i: number) => (
                    <VideoPageCard key={`video-${i}`} item={item} defaultThumbnail={nvData.defaultThumbnail} />
                  ))}
                </NewsVideosScrollRow>
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
