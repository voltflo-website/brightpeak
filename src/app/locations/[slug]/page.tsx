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

function loadCompanySettings(): any {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/home/CompanySettings.json"),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function loadServiceCards(): any[] {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/home/ServiceCardsSection.json"),
      "utf-8"
    );
    const data = JSON.parse(content);
    return data.cards || [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const data = loadLocations();
  return (data.locations || []).map((loc: any) => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = loadLocations();
  const loc = (data.locations || []).find((l: any) => l.slug === slug);
  const seoData = loadSeoData();

  if (!loc) {
    return { title: "Location Not Found" };
  }

  const title = `${loc.title} | ${seoData.siteName || "BrightPeak Energy"}`;
  const description = (loc.description || "").replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `${seoData.siteUrl}/locations/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${seoData.siteUrl}/locations/${slug}`,
      siteName: seoData.siteName,
      images: [
        {
          url: `${seoData.siteUrl}${loc.image || "/images/hero/hero-solar-panels.webp"}`,
          width: 1200,
          height: 630,
          alt: loc.title,
        },
      ],
      type: "website",
    },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const data = loadLocations();
  const locations = data.locations || [];
  const loc = locations.find((l: any) => l.slug === slug);

  if (!loc) {
    notFound();
  }

  const seoData = loadSeoData();
  const company = loadCompanySettings();
  const allServices = loadServiceCards();

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${seoData.business?.name || company.companyName || "BrightPeak Energy"} — ${loc.name}`,
    description: (loc.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
    url: `${seoData.siteUrl}/locations/${slug}`,
    telephone: seoData.business?.phone || company.phone?.href?.replace("tel:", "") || "",
    email: seoData.business?.email || company.email?.href?.replace("mailto:", "") || "",
    image: `${seoData.siteUrl}${loc.image || "/images/hero/hero-solar-panels.webp"}`,
    logo: `${seoData.siteUrl}${seoData.business?.logo || "/images/company-logo.png"}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: loc.name,
      addressRegion: loc.name,
      addressCountry: seoData.business?.address?.country || "IE",
    },
    areaServed: {
      "@type": "City",
      name: loc.name,
    },
    openingHoursSpecification: (seoData.business?.openingHours || ["Mo-Fr 08:00-17:00"]).map((h: string) => {
      const [days, times] = h.split(" ");
      const [opens, closes] = (times || "08:00-17:00").split("-");
      const dayMap: Record<string, string> = {
        Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday",
        Fr: "Friday", Sa: "Saturday", Su: "Sunday",
      };
      const dayRange = days || "Mo-Fr";
      let dayOfWeek: string[];
      if (dayRange.includes("-")) {
        const [start, end] = dayRange.split("-");
        const allDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        const si = allDays.indexOf(start);
        const ei = allDays.indexOf(end);
        dayOfWeek = allDays.slice(si, ei + 1).map((d) => dayMap[d] || d);
      } else {
        dayOfWeek = dayRange.split(",").map((d: string) => dayMap[d.trim()] || d.trim());
      }
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
        opens,
        closes,
      };
    }),
    priceRange: seoData.business?.priceRange || "€€",
    sameAs: (seoData.business?.sameAs || []).map((s: string) => s.replace(/^:\s*/, "")),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Renewable Energy Services in ${loc.name}`,
      itemListElement: (loc.services || []).map((service: string, i: number) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: {
          "@type": "Service",
          name: service,
          areaServed: loc.name,
        },
      })),
    },
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
        name: "Locations",
        item: `${seoData.siteUrl}/locations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: loc.name,
        item: `${seoData.siteUrl}/locations/${slug}`,
      },
    ],
  };

  const matchedServices = allServices.filter((card: any) =>
    (loc.services || []).some((s: string) =>
      card.title?.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(card.title?.toLowerCase() || "")
    )
  );

  const otherLocations = locations.filter((l: any) => l.slug !== slug);

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="default" pagePath={`/locations/${slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageBanner
        eyebrow="Service Area"
        title={`Solar Panels & Renewable Energy in ${loc.name}`}
        bannerImage={loc.image}
      />

      <section className="py-16 md:py-20">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="mb-4">
            <Link
              href="/locations"
              className="text-sm font-semibold inline-flex items-center gap-1"
              style={{ color: "var(--teal)" }}
            >
              ← All Locations
            </Link>
          </div>

          {loc.highlights && loc.highlights.length > 0 && (
            <div
              className="flex flex-wrap gap-8 justify-center p-6 rounded-xl mb-10"
              style={{ background: "var(--bg-secondary)" }}
            >
              {loc.highlights.map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <strong className="block text-2xl font-bold" style={{ color: "var(--teal)" }}>{stat.value}</strong>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          <div
            className="prose max-w-none rich-html text-base leading-relaxed mb-12"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(loc.description || "") }}
          />

          {loc.services && loc.services.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                Our Services in {loc.name}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loc.services.map((service: string, i: number) => {
                  const matched = matchedServices.find((card: any) =>
                    card.title?.toLowerCase().includes(service.toLowerCase()) ||
                    service.toLowerCase().includes(card.title?.toLowerCase() || "")
                  );
                  const href = matched?.href || "#";

                  return (
                    <Link
                      key={i}
                      href={href}
                      className="flex items-center gap-3 p-4 rounded-lg border transition-colors hover:border-current"
                      style={{ borderColor: "var(--gray-200)", color: "var(--teal)" }}
                    >
                      <span className="text-lg">✓</span>
                      <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {service}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className="rounded-xl p-8 mb-12 text-center"
            style={{ background: "var(--brand-primary)", color: "#fff" }}
          >
            <h2 className="text-2xl font-bold mb-3">
              Get a Free Quote in {loc.name}
            </h2>
            <p className="mb-6 opacity-90">
              Ready to start saving on your energy bills? Contact our {loc.name} team today for a free, no-obligation consultation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/contact"
                className="inline-block px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#fff", color: "var(--brand-primary)" }}
              >
                Request a Quote
              </a>
              {(company.phone?.href) && (
                <a
                  href={company.phone.href}
                  className="inline-block px-6 py-3 rounded-lg font-semibold border-2 border-white transition-opacity hover:opacity-90"
                  style={{ color: "#fff" }}
                >
                  Call {company.phone.label}
                </a>
              )}
            </div>
          </div>

          {otherLocations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                Other Areas We Serve
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherLocations.map((other: any) => (
                  <Link
                    key={other.slug}
                    href={`/locations/${other.slug}`}
                    className="group p-4 rounded-lg border transition-shadow hover:shadow-md"
                    style={{ borderColor: "var(--gray-200)" }}
                  >
                    <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{other.name}</h3>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--teal)" }}
                    >
                      View Details →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--gray-200)" }}>
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <Link
                href="/locations"
                className="text-sm font-semibold inline-flex items-center gap-1"
                style={{ color: "var(--teal)" }}
              >
                ← All Locations
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
