import "./globals.css"; // 
import { AuthProvider } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";
import FloatingHomeButton from "@/components/ui/FloatingHomeButton";
import MessageAlertGate from "@/components/messaging/MessageAlertGate";
import PwaInstallGate from "@/components/pwa/PwaInstallGate";

const baseUrl = "https://www.queeratlas.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Queer Atlas",
    template: "%s | Queer Atlas",
  },
  description:
    "Global queer discovery atlas for venues, events, guides, and member community signal.",
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
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
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
    "queer venues",
    "queer events",
    "gay bars",
    "community guides",
  ],
  openGraph: {
    title: "Queer Atlas",
    description:
      "Find the city. Feel the signal. Global queer discovery for places, events, and community.",
    url: "https://www.queeratlas.app",
    siteName: "Queer Atlas",
    images: [
      {
        url: "/queer-atlas-heart-logo-progress.png",
        width: 1200,
        height: 630,
        alt: "Queer Atlas",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Atlas",
    description:
      "Global queer discovery for venues, events, and community signal.",
    images: ["/queer-atlas-heart-logo-progress.png"],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Queer Atlas",
    url: baseUrl,
    description:
      "Global queer discovery atlas for venues, events, guides, and member community signal.",
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "Queer Atlas",
      url: baseUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          {children}
          <FloatingHomeButton />
          <MessageAlertGate />
          <PwaInstallGate />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

