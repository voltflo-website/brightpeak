import { sanitizeHtml } from "../../lib/sanitize";
import type { CustomPage } from "../../lib/customPages";

interface Props {
  page: CustomPage;
}

const CustomHomeSection = ({ page }: Props) => {
  if (page.type === "image") {
    const imgSrc = page.imageUrl || "";
    return (
      <section className="custom-image-section" id={`custom-${page.slug}`}>
        {imgSrc && (
          <img
            src={imgSrc}
            alt={page.hero.title || "Page image"}
            className="custom-image-full"
            loading="lazy"
          />
        )}
      </section>
    );
  }

  if (page.type === "iframe") {
    const iframeSafe = page.iframeUrl && /^https?:\/\//i.test(page.iframeUrl) ? page.iframeUrl : "";
    return (
      <section className="custom-iframe-section" id={`custom-${page.slug}`}>
        {page.hero.title && (
          <div className="custom-iframe-header">
            <div className="container">
              {page.hero.eyebrow && <p className="page-eyebrow">{page.hero.eyebrow}</p>}
              <h2 className="text-3xl font-extrabold text-center">{page.hero.title}</h2>
              {page.hero.subtitle && <p className="text-center mt-2" style={{ color: "var(--text-secondary)" }}>{page.hero.subtitle}</p>}
            </div>
          </div>
        )}
        {iframeSafe && (
          <iframe
            src={iframeSafe}
            className="custom-iframe"
            title={page.hero.title || "Embedded content"}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20" id={`custom-${page.slug}`}>
      <div className="container">
        <div className="text-center mb-12">
          {page.content.eyebrow && (
            <p className="page-eyebrow">{page.content.eyebrow}</p>
          )}
          {page.content.title && (
            <h2 className="text-3xl font-extrabold">{page.content.title}</h2>
          )}
        </div>
        {page.content.cards && page.content.cards.length > 0 && (
          <div
            className={`solar-cards-grid${
              page.content.cards.length > 3 ? " solar-cards-grid-2col" : ""
            }`}
          >
            {page.content.cards.map((card: any, i: number) => (
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
        )}
      </div>
    </section>
  );
};

export default CustomHomeSection;
