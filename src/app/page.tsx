import HomePageClient from "./components/home/HomePageClient";
import { generatePageMetadata } from "./components/SeoHead";
import StructuredData from "./components/StructuredData";
import { loadAllHomeData } from "./lib/loadAllHomeData";

export const revalidate = 60;

export const metadata = generatePageMetadata("/");

function getAllReviews(testimonialsData: Record<string, unknown>) {
  const reviews: { quote: string; author: string; role: string }[] = [];
  const groups = (testimonialsData as any).groups || [];
  groups.forEach((group: any) => {
    group.items.forEach((item: any) => {
      reviews.push({ quote: item.quote, author: item.author, role: item.role });
    });
  });
  return reviews;
}

export default function Home() {
  const allData = loadAllHomeData();
  const faqItems = (allData.faq as any).items || [];
  const reviews = getAllReviews(allData.testimonials);

  return (
    <>
      <StructuredData
        pageType="home"
        pagePath="/"
        faqItems={faqItems}
        reviews={reviews}
      />
      <HomePageClient allData={allData} />
    </>
  );
}
