const TrustBarSection = ({ data }: { data: Record<string, unknown> }) => {
  const trustBarData = data as any;
  if (!trustBarData.enabled) return null;

  return (
    <section id="trust-bar" className="trust-bar">
    <div className="container trust-bar-inner">
      <div>
        <p className="trust-bar-title">{trustBarData.title}</p>
        <p className="trust-bar-sub">{trustBarData.subtitle}</p>
      </div>
      <div className="trust-bar-badges">
        {trustBarData.badges.map((badge: string) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
    </div>
    </section>
  );
};

export default TrustBarSection;
