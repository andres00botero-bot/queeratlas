import { serializeJsonLd } from "@/lib/jsonLd";
import "./globals.css"; // 
import { AuthProvider } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";
import { buildPrimaryEntityGraph, QA_SITE_URL } from "@/lib/seo/entityAuthority";
import DeferredGlobalChrome from "@/components/ui/DeferredGlobalChrome";
import DevErrorProbe from "@/components/ui/DevErrorProbe";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";
import { getClientMessages } from "@/lib/i18n/messages";
import { localizedAlternates, localizedCopy, localizedOpenGraphUrl, openGraphLocale } from "@/lib/seo/localizedSeo";

const baseUrl = QA_SITE_URL;

const baseMetadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Queer Atlas - Global Queer Guide, Events & Venues",
    template: "%s | Queer Atlas",
  },
  description:
    "Global queer travel atlas for LGBTQ-safe places, inclusive nightlife, events, and trusted community signal.",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  alternates: {
    canonical: "/",
  },
  applicationName: "Queer Atlas",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/qa-logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/qa-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/qa-logo-192.png", sizes: "192x192", type: "image/png" }],
  },
  category: "travel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "Queer Atlas",
    "LGBTQ travel",
    "gay travel",
    "queer travel",
    "gay travel guide",
    "LGBTQ friendly countries",
    "safest countries for LGBTQ travelers",
    "queer vibe",
    "safe queer nightlife",
    "queer traveler guide",
    "inclusive nightlife",
    "queer neighborhoods",
    "LGBTQ nightlife",
    "gay bars near me",
    "queer friendly places",
    "LGBTQ events",
    "LGBTQ safety map",
    "LGBTQ travel safety",
    "queer safe spaces",
    "queer venues",
    "queer events",
    "gay bars",
    "community guides",
  ],
  openGraph: {
    title: "Queer Atlas - Global Queer Guide, Events & Venues",
    description:
      "Find LGBTQ-friendly cities, safe queer nightlife, events, and trusted local signal.",
    url: "https://www.queeratlas.app",
    siteName: "Queer Atlas",
    images: [
      {
        url: "/queer-atlas-logo.png",
        width: 1024,
        height: 1024,
        alt: "Queer Atlas",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Atlas - Global Queer Guide, Events & Venues",
    description:
      "LGBTQ travel, queer-safe nightlife, events, and trusted city-by-city signal.",
    images: ["/queer-atlas-logo.png"],
  },
};

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-qa-locale"), DEFAULT_LOCALE);
  const pathname = requestHeaders.get("x-qa-pathname") || "/";
  const copy = localizedCopy(locale, {
    en: { title: baseMetadata.title, description: baseMetadata.description, ogTitle: baseMetadata.openGraph.title, ogDescription: baseMetadata.openGraph.description, twitterTitle: baseMetadata.twitter.title, twitterDescription: baseMetadata.twitter.description },
    es: { title: "Queer Atlas en español | Guía LGBTQ+ de ciudades, eventos y lugares", description: "Queer Atlas en español: guía LGBTQ+ global con ciudades, lugares seguros, vida nocturna inclusiva y eventos queer.", ogTitle: "Queer Atlas en español | Guía LGBTQ+ de ciudades, eventos y lugares", ogDescription: "Queer Atlas en español para descubrir ciudades LGBTQ+, vida nocturna queer segura y eventos.", twitterTitle: "Queer Atlas en español | Guía LGBTQ+ de ciudades, eventos y lugares", twitterDescription: "Queer Atlas en español: viajes LGBTQ+, vida nocturna inclusiva y eventos." },
    de: { title: "Queer Atlas auf Deutsch | LGBTQ+ Guide für Städte, Events und Orte", description: "Queer Atlas auf Deutsch: dein globaler LGBTQ+ Guide für Städte, sichere Orte, queeres Nachtleben und Events.", ogTitle: "Queer Atlas auf Deutsch | LGBTQ+ Guide für Städte, Events und Orte", ogDescription: "Entdecke LGBTQ+ Städte, queeres Nachtleben, sichere Orte und Events – mit lokalem Kontext.", twitterTitle: "Queer Atlas auf Deutsch | LGBTQ+ Guide", twitterDescription: "LGBTQ+ Reisen, queeres Nachtleben, sichere Orte und Events." },
    fr: { title: "Queer Atlas en français | Guide LGBTQ+ des villes, événements et lieux", description: "Queer Atlas en français : votre guide LGBTQ+ mondial des villes, lieux sûrs, vie nocturne inclusive et événements queer.", ogTitle: "Queer Atlas en français | Guide LGBTQ+ des villes, événements et lieux", ogDescription: "Découvrez des villes LGBTQ+, une vie nocturne queer plus sûre, des lieux de confiance et des événements avec du contexte local.", twitterTitle: "Queer Atlas en français | Guide LGBTQ+", twitterDescription: "Voyages LGBTQ+, vie nocturne queer inclusive, lieux de confiance et événements." },
  });

  return {
    ...baseMetadata,
    title: copy.title,
    description: copy.description,
    keywords: locale === "es" ? ["Queer Atlas en español", "guía LGBTQ+", "viajes queer", "ciudades queer", "eventos LGBTQ+", "vida nocturna queer", "lugares LGBTQ+ seguros"] : locale === "de" ? ["Queer Atlas Deutsch", "LGBTQ+ Reiseführer", "queere Städte", "queere Events", "queeres Nachtleben", "schwule Bars", "LGBTQ+ sichere Orte"] : locale === "fr" ? ["Queer Atlas français", "guide LGBTQ+", "voyage queer", "villes queer", "événements LGBTQ+", "vie nocturne queer", "lieux LGBTQ+ sûrs"] : baseMetadata.keywords,
    alternates: localizedAlternates(pathname, locale),
    openGraph: {
      ...baseMetadata.openGraph,
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: localizedOpenGraphUrl(pathname, locale),
      locale: openGraphLocale(locale),
      images: baseMetadata.openGraph.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: copy.twitterTitle,
      description: copy.twitterDescription,
    },
  };
}

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-qa-locale"), DEFAULT_LOCALE);
  const jsonLd = buildPrimaryEntityGraph(locale);

  return (
    <html lang={locale}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <AuthProvider>
          <LocaleProvider locale={locale} messages={getClientMessages(locale)}>
            <DevErrorProbe />
            {children}
            <DeferredGlobalChrome />
          </LocaleProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
