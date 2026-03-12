import Image from "next/image";
import { sanitizeHtml } from "../../lib/sanitize";

const cardIcons = [
  (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
      <line x1="23" y1="13" x2="23" y2="11" />
    </svg>
  ),
  (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
];

const ServiceCardsSection = ({ data }: { data: Record<string, unknown> }) => {
  const cardsData = data as any;
  if (!cardsData.enabled) return null;

  const style = cardsData.style || 1;

  if (style === 2) {
    return (
      <section id="services" className="service-cards-section">
        <div className="container service-cards-v2">
          {cardsData.cards.map((card: any) => (
            <a key={card.href} href={card.href} className="service-card-v2">
              <div className="service-card-v2-img">
                <Image src={card.image} alt={card.title} width={400} height={250} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <div className="service-card-v2-body">
                <h3>{card.title}</h3>
                <div className="rich-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.description || "") }} />
              </div>
              <span className="sc-arrow">{cardsData.arrow}</span>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="service-cards-section">
      <div className="container service-cards">
        {cardsData.cards.map((card: any, index: number) => (
          <a key={card.href} href={card.href} className="service-card">
            <div className="sc-icon-wrap">{cardIcons[index]}</div>
            <h3>{card.title}</h3>
            <div className="rich-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.description || "") }} />
            <span className="sc-arrow">{cardsData.arrow}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ServiceCardsSection;
