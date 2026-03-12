import { getContactFormUrl, getVoltfloUrl, externalLinkProps } from "../../lib/siteSettings";
import { sanitizeHtml } from "../../lib/sanitize";

const HowSection = ({ data, siteSettings, heroCta }: { data: Record<string, unknown>; siteSettings: Record<string, unknown>; heroCta?: { label: string; href: string } }) => {
  const howData = data as any;
  if (!howData.enabled) return null;

  return (
    <section id="how" className="section section-light how-section">
    <div className="container">
      <p className="section-eyebrow">{howData.eyebrow}</p>
      <h2 className="section-title">{howData.title}</h2>
      <p className="section-sub">{howData.subtitle}</p>
      <div className="how-grid">
        {howData.steps.map((step: any) => (
          <div key={step.number} className="how-step">
            <span className="how-num">{step.number}</span>
            <div className="how-icon">{step.icon}</div>
            <span className="how-time">{step.time}</span>
            <h3>{step.title}</h3>
            <div className="rich-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.description || "") }} />
            <ul>
              {step.bullets.map((bullet: string) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="how-cta">
        <a href={getVoltfloUrl(siteSettings)} className="btn btn-primary" {...externalLinkProps(getVoltfloUrl(siteSettings))}>
          {heroCta?.label || howData.cta.label}
        </a>
      </div>
    </div>
    </section>
  );
};

export default HowSection;
