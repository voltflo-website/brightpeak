import { notFound, redirect } from "next/navigation";
import PageLayout from "../components/PageLayout";
import PageBanner from "../components/PageBanner";
import { loadNavFooterData } from "../lib/loadAllHomeData";
import { sanitizeHtml } from "../lib/sanitize";
import { loadCustomPages, CustomPage } from "../lib/customPages";
import { checkRedirect } from "../lib/redirects";

export const dynamic = "force-dynamic";

export default async function CustomPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();
  const allPages = loadCustomPages();
  const page = allPages.find(
    (p: CustomPage) => p.enabled && p.placement === "page" && p.slug === slug
  );

  if (!page) {
    const target = checkRedirect("/" + slug);
    if (target) {
      redirect(target);
    }
    notFound();
  }

  const { navigation, footer, headerSettings, siteSettings, heroCta } =
    loadNavFooterData();

  if (page.type === "image") {
    const imgSrc = page.imageUrl || "";
    return (
      <PageLayout
        navData={navigation}
        footerData={footer}
        headerSettings={headerSettings}
        siteSettings={siteSettings}
        heroCta={heroCta}
      >
        <PageBanner
          eyebrow={page.hero.eyebrow}
          title={page.hero.title}
          subtitle={page.hero.subtitle}
          bannerImage={page.hero.bannerImage}
        />
        {imgSrc && (
          <section className="custom-image-section">
            <img
              src={imgSrc}
              alt={page.hero.title || "Page image"}
              className="custom-image-full"
              loading="lazy"
            />
          </section>
        )}
      </PageLayout>
    );
  }

  if (page.type === "iframe") {
    const iframeSafe = page.iframeUrl && /^https?:\/\//i.test(page.iframeUrl) ? page.iframeUrl : "";
    return (
      <PageLayout
        navData={navigation}
        footerData={footer}
        headerSettings={headerSettings}
        siteSettings={siteSettings}
        heroCta={heroCta}
      >
        <PageBanner
          eyebrow={page.hero.eyebrow}
          title={page.hero.title}
          subtitle={page.hero.subtitle}
          bannerImage={page.hero.bannerImage}
        />
        {iframeSafe && (
          <section className="custom-iframe-section">
            <iframe
              src={iframeSafe}
              className="custom-iframe"
              title={page.hero.title || "Embedded content"}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </section>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout
      navData={navigation}
      footerData={footer}
      headerSettings={headerSettings}
      siteSettings={siteSettings}
      heroCta={heroCta}
    >
      <PageBanner
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        bannerImage={page.hero.bannerImage}
      />

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="page-eyebrow">{page.content.eyebrow}</p>
            <h2 className="text-3xl font-extrabold">{page.content.title}</h2>
          </div>
          <div
            className={`solar-cards-grid${
              (page.content.cards || []).length > 3
                ? " solar-cards-grid-2col"
                : ""
            }`}
          >
            {(page.content.cards || []).map((card: any, i: number) => (
              <div key={i} className="solar-info-card">
                <div className="solar-info-card-text">
                  <h3
                    className="font-bold text-xl mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {card.subHeading}
                  </h3>
                  <div
                    className="leading-relaxed rich-html"
                    style={{ color: "var(--text-secondary)" }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(card.paragraph || ""),
                    }}
                  />
                </div>
                {card.image && (
                  <div className="solar-info-card-image">
                    <img
                      src={card.image}
                      alt={card.subHeading}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
