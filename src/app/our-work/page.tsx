import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata = generatePageMetadata("/our-work");

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

export default function OurWorkPage() {
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const caseStudiesData = loadCaseStudies();
  const cards = caseStudiesData.cards || [];

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/our-work" />
      <PageBanner
        eyebrow="Our Work"
        title="See Our Recent Projects"
        subtitle="From residential homes to large-scale commercial installations, we've completed over 2,800 projects across Ireland."
        bannerImage="/images/case-studies/residential-project.webp"
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card: any) => (
              <Link
                key={card.slug}
                href={`/our-work/${card.slug}`}
                className="group block rounded-xl overflow-hidden shadow-sm border transition-shadow hover:shadow-lg"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
                  <img
                    src={card.image?.src || (card.images && card.images[0]) || ""}
                    alt={card.image?.alt || card.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{card.sub}</span>
                    <h3 className="text-lg font-bold mt-1">{card.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  {card.stats && card.stats.length > 0 && (
                    <div className="flex gap-6 mb-3">
                      {card.stats.map((stat: any, i: number) => (
                        <div key={i} className="text-center">
                          <strong className="block text-lg font-bold" style={{ color: "var(--teal)" }}>{stat.value}</strong>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span
                    className="text-sm font-semibold inline-flex items-center gap-1"
                    style={{ color: "var(--teal)" }}
                  >
                    View Project →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
