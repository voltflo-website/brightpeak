"use client";

import { useEffect, useState } from "react";

const FONT_OPTIONS = [
  "League Spartan",
  "Inter",
  "Poppins",
  "Montserrat",
  "Raleway",
  "Open Sans",
  "Lato",
  "Roboto",
  "Nunito",
  "Work Sans",
  "Quicksand",
  "Comfortaa",
  "Baloo 2",
  "Fredoka",
  "Chewy",
  "Pacifico",
  "Caveat",
  "Patrick Hand",
];

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2";

function buildFontUrl(font: string) {
  const encoded = font.replace(/ /g, "+");
  return `${GOOGLE_FONTS_URL}?family=${encoded}:wght@400;500;600;700;800&display=swap`;
}

export { FONT_OPTIONS };

export default function FontLoader() {
  const [font, setFont] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/data?file=SiteSettings.json")
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.font) {
          setFont(json.data.font);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!font) return;

    const existing = document.querySelector('link[data-font-loader]');
    if (existing) existing.remove();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = buildFontUrl(font);
    link.setAttribute("data-font-loader", "true");
    document.head.appendChild(link);

    document.documentElement.style.setProperty("--font-sans", `"${font}", sans-serif`);
    document.documentElement.style.setProperty("--font-heading", `"${font}", sans-serif`);
  }, [font]);

  return null;
}
