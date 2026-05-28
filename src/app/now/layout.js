export const metadata = {
  title: "Queer News Feed, Safety Index & Top Queer Destinations",
  description:
    "Daily queer news plus Queer Safety Index and Top Queer Destinations rankings with LGBTQ travel safety signals, nightlife shifts, and policy watch across major cities.",
  keywords: [
    "queer news",
    "LGBTQ news",
    "gay news today",
    "queer community news",
    "LGBTQ travel news",
    "queer safety index",
    "top queer destinations",
    "LGBTQ city rankings",
    "queer travel safety",
    "safe queer nightlife",
    "inclusive nightlife",
    "LGBTQ policy updates",
    "queer rights news",
    "LGBTQ events news",
    "queer city updates",
  ],
  alternates: {
    canonical: "/now",
  },
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
  openGraph: {
    title: "Queer Safety Index & Top Queer Destinations | Queer Atlas",
    description:
      "Track queer world news plus live Top Queer Destinations and Queer Safety Index rankings in one premium editorial feed.",
    url: "/now",
    type: "website",
    images: [
      {
        url: "/queer-atlas-heart-logo-progress.png",
        width: 1200,
        height: 630,
        alt: "Queer Atlas Now - queer news feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Safety Index & Top Queer Destinations | Queer Atlas",
    description:
      "Daily queer news with Top Queer Destinations and Queer Safety Index rankings, plus travel safety and nightlife shifts.",
    images: ["/queer-atlas-heart-logo-progress.png"],
  },
};

export default function NowLayout({ children }) {
  return children;
}
