import type { Metadata } from "next";
import { League_Spartan, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../../packages/admin/styles/sidebar.css";
import AdminSidebar from "./components/AdminSidebar";
import FontLoader from "./components/FontLoader";
import DataLayerTracker from "./components/DataLayerTracker";
import fs from "fs";
import path from "path";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

function loadSeoData(): any {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), "data/seo.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return { defaultTitle: "", defaultDescription: "", siteUrl: "https://localhost", siteName: "", defaultImage: "", locale: "en_IE" };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seoData = loadSeoData();
  return {
    title: {
      default: seoData.defaultTitle,
      template: "%s",
    },
    description: seoData.defaultDescription,
    icons: {
      icon: "/icon.svg",
    },
    metadataBase: new URL(seoData.siteUrl || "https://localhost"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: seoData.defaultTitle,
      description: seoData.defaultDescription,
      url: seoData.siteUrl,
      siteName: seoData.siteName,
      images: [
        {
          url: seoData.defaultImage,
          width: 1200,
          height: 630,
          alt: seoData.siteName,
        },
      ],
      locale: seoData.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.defaultTitle,
      description: seoData.defaultDescription,
      images: [seoData.defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function loadSiteSettings() {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), "data/home/SiteSettings.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = loadSiteSettings();
  const primary = settings.primaryColor || "#009968";
  const primaryDark = settings.primaryDark || "#007a54";
  const accent = settings.accentColor || "#fcb900";
  const bannerOverlay = settings.bannerOverlay || "#0f172a";
  const quoteBtn = settings.quoteButtonColor || primary;
  const contactBtn = settings.contactButtonColor || primaryDark;
  const gtmId = settings.gtmId || "";
  const br = Math.max(1, Math.min(5, settings.borderRadius || 1));
  const radiusBase = br === 1 ? 0 : (br - 1) * 0.25;
  const radiusLg = br === 1 ? 0 : (br - 1) * 0.5;
  const radiusXl = br === 1 ? 0 : (br - 1) * 0.75;
  const radius2xl = br === 1 ? 0 : (br - 1) * 1.0;
  const adminEnabled = process.env.ADMIN_ENABLED === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {adminEnabled && <meta name="admin-enabled" content="true" />}
      </head>
      <body
        className={`${leagueSpartan.variable} ${inter.variable} antialiased`}
        style={{ "--brand-primary": primary, "--brand-primary-dark": primaryDark, "--brand-accent": accent, "--brand-banner-overlay": bannerOverlay, "--btn-quote": quoteBtn, "--btn-contact": contactBtn, "--radius": `${radiusBase}rem`, "--radius-lg": `${radiusLg}rem`, "--radius-xl": `${radiusXl}rem`, "--radius-2xl": `${radius2xl}rem` } as React.CSSProperties}
        suppressHydrationWarning
      >
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        <FontLoader />
        {children}
        {adminEnabled && <AdminSidebar />}
        <DataLayerTracker />
      </body>
    </html>
  );
}
