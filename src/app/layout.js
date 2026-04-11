import "./globals.css"; // 
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  metadataBase: new URL("https://queeratlas.app"),
  title: {
    default: "Queer Atlas",
    template: "%s | Queer Atlas",
  },
  description:
    "Global queer discovery atlas for venues, events, guides, and member community signal.",
  applicationName: "Queer Atlas",
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
    url: "https://queeratlas.app",
    siteName: "Queer Atlas",
    images: [
      {
        url: "/queer-atlas-heart-logo-progress.svg",
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
    images: ["/queer-atlas-heart-logo-progress.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <body>
      <AuthProvider>{children}</AuthProvider>
    </body>
    </html>
  );
}
