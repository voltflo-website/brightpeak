import { Fragment } from "react";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import ServiceCardsSection from "./ServiceCardsSection";
import TrustBarSection from "./TrustBarSection";
import Footer from "./Footer";
import type { HomeData } from "../../lib/loadAllHomeData";
import type { CustomPage } from "../../lib/customPages";
import VideoSection from "./VideoSection";
import WhyChooseSection from "./WhyChooseSection";
import ImpactSection from "./ImpactSection";
import CaseStudiesSection from "./CaseStudiesSection";
import HowSection from "./HowSection";
import TestimonialsSection from "./TestimonialsSection";
import TestimonialsFullSection from "./TestimonialsFullSection";
import FaqSection from "./FaqSection";
import AccreditationsSection from "./AccreditationsSection";
import NewsVideosSection from "./NewsVideosSection";
import FinalCtaSection from "./FinalCtaSection";
import CustomHomeSection from "./CustomHomeSection";

interface Props {
  allData: HomeData;
}

const HomePage = ({ allData }: Props) => {
  const homePageData = allData.homePage as any;
  const sections = homePageData.sections || {};
  const orderedSections = (homePageData.order || []) as string[];

  const heroCta = allData.heroCta as { label: string; href: string };

  const customPages = (allData.customPages || []) as CustomPage[];
  const homepageSections = customPages.filter(
    (p) => p.placement === "homepage" && p.slug
  );

  const customSectionMap: Record<string, React.ReactNode> = {};
  for (const cp of homepageSections) {
    const key = `custom_${cp.slug}`;
    customSectionMap[key] = <CustomHomeSection page={cp} />;
  }

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <HeroSection data={allData.hero} siteSettings={allData.siteSettings} />,
    serviceCards: <ServiceCardsSection data={allData.serviceCards} />,
    trustBar: <TrustBarSection data={allData.trustBar} />,
    video: <VideoSection data={allData.video} />,
    whyChoose: <WhyChooseSection data={allData.whyChoose} siteSettings={allData.siteSettings} heroCta={heroCta} heroData={allData.hero} />,
    impact: <ImpactSection data={allData.impact} />,
    caseStudies: <CaseStudiesSection data={allData.caseStudies} />,
    how: <HowSection data={allData.how} siteSettings={allData.siteSettings} heroCta={heroCta} />,
    testimonials: <TestimonialsSection data={allData.testimonials} />,
    testimonialsPage: <TestimonialsFullSection data={allData.testimonialsPage as any} />,
    faq: <FaqSection data={allData.faq} />,
    accreditations: <AccreditationsSection data={allData.accreditations} />,
    newsVideos: <NewsVideosSection data={allData.newsVideos} />,
    finalCta: <FinalCtaSection data={allData.finalCta} siteSettings={allData.siteSettings} heroCta={heroCta} />,
    ...customSectionMap,
  };

  const resolvedOrder = [
    ...orderedSections,
    ...Object.keys(customSectionMap).filter((k) => !orderedSections.includes(k)),
  ];

  return (
    <div className="min-h-screen">
      {sections.navigation && (
        <Navigation data={allData.navigation} headerSettings={allData.headerSettings} siteSettings={allData.siteSettings} companySettings={allData.companySettings} heroCta={heroCta} />
      )}

      <main>
        {resolvedOrder
          .filter((key) => {
            if (!(key in sectionMap)) return false;
            if (key.startsWith("custom_")) return sections[key] !== false;
            return sections[key];
          })
          .map((key) => (
            <Fragment key={key}>
              {sectionMap[key]}
            </Fragment>
          ))}
      </main>

      {sections.footer && <Footer data={allData.footer} siteSettings={allData.siteSettings} companySettings={allData.companySettings} heroCta={heroCta} />}
    </div>
  );
};

export default HomePage;
