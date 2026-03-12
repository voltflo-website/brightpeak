import { getContactFormUrl, getVoltfloUrl, externalLinkProps } from "../../lib/siteSettings";
import { sanitizeHtml } from "../../lib/sanitize";

const WhyChooseSection = ({ data, siteSettings, heroCta, heroData }: { data: Record<string, unknown>; siteSettings: Record<string, unknown>; heroCta?: { label: string; href: string }; heroData?: Record<string, unknown> }) => {
  const whyChooseData = data as any;
  if (!whyChooseData.enabled) return null;

  const heroStats = (heroData as any)?.stats?.items || [];
  const statsToShow = heroStats.filter((s: any) => s.value && s.label);

  return (
    <section id="why-choose" className="section why-choose">
    <div className="container">
      <p className="section-eyebrow">{whyChooseData.eyebrow}</p>
      <h2 className="section-title">{whyChooseData.title}</h2>
      <div className="section-subtitle rich-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(whyChooseData.description || "") }} />
      <div className="grid-2" style={{ marginTop: "3rem" }}>
        <div className="why-img">
          {/\.(mp4|webm|ogg|mov)$/i.test(whyChooseData.image.src) ? (
            <video
              src={whyChooseData.image.src}
              autoPlay
              loop
              muted
              playsInline
              className="why-video"
            />
          ) : (
            <img src={whyChooseData.image.src} alt={whyChooseData.image.alt} loading="lazy" />
          )}
        </div>
        <div className="why-content">
          <div className="why-trust">
            {whyChooseData.trustItems.map((item: string) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          {statsToShow.length > 0 && (
            <div className="why-stats">
              {statsToShow.map((stat: any) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          <a href={getVoltfloUrl(siteSettings)} className="btn btn-primary" {...externalLinkProps(getVoltfloUrl(siteSettings))}>
            {heroCta?.label || whyChooseData.cta.label}
          </a>
        </div>
      </div>
    </div>
    </section>
  );
};

export default WhyChooseSection;
