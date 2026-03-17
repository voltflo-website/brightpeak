import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata = generatePageMetadata("/locations");

export const revalidate = 60;

function loadLocations() {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/home/LocationsSection.json"),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return { locations: [] };
  }
}

export default function LocationsPage() {
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const locData = loadLocations();
  const locations = locData.locations || [];

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath="/locations" />
      <PageBanner
        eyebrow={locData.eyebrow || "Service Areas"}
        title={locData.title || "Areas We Serve"}
        subtitle={locData.subtitle}
        bannerImage={locData.bannerImage}
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((loc: any) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="group block rounded-xl overflow-hidden shadow-sm border transition-shadow hover:shadow-lg"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
                  <img
                    src={loc.image || "/images/hero/hero-solar-panels.webp"}
                    alt={`Renewable energy services in ${loc.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
                  />
                  <div className="absolute bottom-0 left-0 p-5 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Service Area</span>
                    <h3 className="text-xl font-bold mt-1">{loc.name}</h3>
                  </div>
                </div>
                <div className="p-5">
                  {loc.services && loc.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {loc.services.slice(0, 4).map((service: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                        >
                          {service}
                        </span>
                      ))}
                      {loc.services.length > 4 && (
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                        >
                          +{loc.services.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                  <span
                    className="text-sm font-semibold inline-flex items-center gap-1"
                    style={{ color: "var(--teal)" }}
                  >
                    View Area Details →
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
