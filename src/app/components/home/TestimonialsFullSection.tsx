import { sanitizeHtml } from "../../lib/sanitize";

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
}

interface Stat {
  value: string;
  label: string;
}

interface TestimonialsFullData {
  enabled?: boolean;
  hero?: { eyebrow?: string; title?: string; subtitle?: string };
  reviews?: Review[];
  stats?: Stat[];
  [key: string]: unknown;
}

const TestimonialsFullSection = ({ data }: { data: TestimonialsFullData }) => {
  if (!data || data.enabled === false) return null;
  const { hero, reviews, stats } = data;
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        {hero && (
          <div className="text-center mb-12">
            {hero.eyebrow && (
              <p className="page-eyebrow">{hero.eyebrow}</p>
            )}
            {hero.title && (
              <h2 className="text-3xl font-extrabold">{hero.title}</h2>
            )}
            {hero.subtitle && (
              <p className="mt-3 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>{hero.subtitle}</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-md border"
              style={{ borderColor: "var(--gray-200)", background: "var(--bg-primary)" }}
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-lg" style={{ color: "var(--brand-accent)" }}>★</span>
                ))}
              </div>
              <div className="mb-4 leading-relaxed text-sm rich-html" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: "&ldquo;" + sanitizeHtml(review.text || "") + "&rdquo;" }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{review.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{review.location}</p>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}
                >
                  {review.service}
                </span>
              </div>
            </div>
          ))}
        </div>

        {stats && stats.length > 0 && (
          <div className="text-center mt-12">
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-extrabold text-brand">{stat.value}</div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsFullSection;
