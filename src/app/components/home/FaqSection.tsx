import Link from "next/link";

const FaqSection = ({ data }: { data: Record<string, unknown> }) => {
  const faqData = data as any;
  if (!faqData.enabled) return null;

  const categories = (faqData.categories || []) as { slug: string; title: string; description: string }[];
  const activeSlugs = new Set(categories.map((c) => c.slug));
  const items = ((faqData.items || []) as { question: string; answer: string; category: string }[])
    .filter((item) => item.category !== "_orphan" && activeSlugs.has(item.category));

  const itemsByCategory = new Map<string, number>();
  for (const item of items) {
    itemsByCategory.set(item.category, (itemsByCategory.get(item.category) || 0) + 1);
  }

  return (
    <section id="faq" className="section section-gray faq-section">
      <div className="container">
        <p className="section-eyebrow">{faqData.eyebrow}</p>
        <h2 className="section-title">{faqData.title}</h2>
        <p className="section-sub">{faqData.subtitle}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {categories.map((cat) => {
            const count = itemsByCategory.get(cat.slug) || 0;
            return (
              <Link
                key={cat.slug}
                href={`/solar-guide/${cat.slug}`}
                className="solar-guide-card group"
              >
                <div className="solar-guide-card-banner">
                  <h3 className="solar-guide-card-banner-title">{cat.title}</h3>
                </div>
                <div className="solar-guide-card-body">
                  <p className="solar-guide-card-desc">{cat.description}</p>
                  <div className="solar-guide-card-footer">
                    <span className="solar-guide-card-count">{count} questions</span>
                    <span className="solar-guide-card-arrow">Explore →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link href="/solar-guide" className="btn btn-primary">
            View Full Solar Guide
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
