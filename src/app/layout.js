import "./globals.css"; // 
import { AuthProvider } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";
import { buildPrimaryEntityGraph, QA_SITE_URL } from "@/lib/seo/entityAuthority";
import DeferredGlobalChrome from "@/components/ui/DeferredGlobalChrome";
import DevErrorProbe from "@/components/ui/DevErrorProbe";

const baseUrl = QA_SITE_URL;

export const metadata = {
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

export default function RootLayout({ children }) {
  const jsonLd = buildPrimaryEntityGraph();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <DevErrorProbe />
          {children}
          <DeferredGlobalChrome />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
