const AccreditationsSection = ({ data }: { data: Record<string, unknown> }) => {
  const accreditationsData = data as any;
  if (!accreditationsData.enabled) return null;

  return (
    <section id="accreditations" className="accreditations">
    <div className="container">
      <p className="accreditations-title">{accreditationsData.title}</p>
      <div className="accreditations-logos">
        {accreditationsData.logos.map((logo: any) => (
          <img key={logo.src} src={logo.src} alt={logo.alt} loading="lazy" />
        ))}
      </div>
    </div>
    </section>
  );
};

export default AccreditationsSection;
