import fs from "fs";
import path from "path";

function loadSeoData(): any {
  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "data/seo.json"),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return { pages: {}, siteUrl: "", siteName: "", defaultTitle: "", defaultDescription: "", defaultImage: "", locale: "en_IE" };
  }
}

type SeoData = ReturnType<typeof loadSeoData>;

export function generatePageMetadata(pagePath: string) {
  const seoData = loadSeoData();
  const pageInfo = seoData.pages?.[pagePath];
  const baseUrl = seoData.siteUrl;

  if (!pageInfo) {
    return {
      title: seoData.defaultTitle,
      description: seoData.defaultDescription,
    };
  }

  return {
    title: pageInfo.title,
    description: pageInfo.description,
    keywords: pageInfo.keywords || undefined,
    alternates: {
      canonical: `${baseUrl}${pagePath === "/" ? "" : pagePath}`,
    },
    openGraph: {
      title: pageInfo.title,
      description: pageInfo.description,
      url: `${baseUrl}${pagePath === "/" ? "" : pagePath}`,
      siteName: seoData.siteName,
      images: [
        {
          url: `${baseUrl}${pageInfo.ogImage || seoData.defaultImage}`,
          width: 1200,
          height: 630,
          alt: pageInfo.title,
        },
      ],
      locale: seoData.locale,
      type: pagePath === "/" ? "website" : "article",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: pageInfo.title,
      description: pageInfo.description,
      images: [`${baseUrl}${pageInfo.ogImage || seoData.defaultImage}`],
    },
  };
}
