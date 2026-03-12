import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { generatePageMetadata } from "../components/SeoHead";
import StructuredData from "../components/StructuredData";
import fs from "fs";
import path from "path";

export const metadata = generatePageMetadata("/services");

export const dynamic = "force-dynamic";

const additionalServices = [
  {
    title: "Heat Pumps",
    description: "Efficient air-to-water and geothermal heat pumps for comfortable, low-cost home heating",
    href: "/heat-pumps",
    image: "/images/services/heat-pump.webp",
  },
  {
    title: "Underfloor Heating",
    description: "Energy-efficient underfloor heating systems for new builds and retrofits across Ireland",
    href: "/underfloor-heating",
    image: "/images/services/underfloor-heating.webp",
  },
];

function loadServiceCards() {
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

export default function ServicesPage() {
  const { navigation, footer, headerSettings, siteSettings, companySettings, heroCta } = loadNavFooterData();
  const serviceCards = loadServiceCards();

  const existingHrefs = new Set(serviceCards.map((c: any) => c.href));
  const extras = additionalServices.filter((s) => !existingHrefs.has(s.href));
  const allServices = [...serviceCards, ...extras];

  return (
    <PageLayout navData={navigation} footerData={footer} headerSettings={headerSettings} siteSettings={siteSettings} companySettings={companySettings} heroCta={heroCta}>
      <StructuredData pageType="service" pagePath="/services" />
      <PageBanner
        eyebrow="What We Do"
        title="Our Services"
        subtitle="Comprehensive renewable energy solutions for homes and businesses across Ireland"
        bannerImage="/images/hero/hero-solar-panels.webp"
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">Renewable Energy Solutions</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              From solar panels to EV chargers, we provide end-to-end installation and support for all your energy needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allServices.map((service: any) => (
              <a
                key={service.href}
                href={service.href}
                className="group block rounded-xl overflow-hidden shadow-sm border transition-shadow hover:shadow-lg"
                style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
              >
                {service.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {service.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    {service.description}
                  </p>
                  <span
                    className="inline-flex items-center text-sm font-semibold"
                    style={{ color: "var(--teal)" }}
                  >
                    Learn More <span className="ml-1">→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          background: "linear-gradient(135deg, var(--brand-banner-overlay) 0%, color-mix(in srgb, var(--brand-banner-overlay) 80%, #334155) 50%, var(--brand-banner-overlay) 100%)",
          color: "#fff",
          padding: "4rem 0",
        }}
      >
        <div className="container text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Start Your Renewable Energy Journey?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            Get a free consultation and find out how much you could save with our renewable energy solutions.
          </p>
          <a href={heroCta.href} className="btn btn-primary">
            {heroCta.label}
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
