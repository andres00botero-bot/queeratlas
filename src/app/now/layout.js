export const metadata = {
  title: "Queer News Feed: LGBTQ World News, Travel & Safety",
  description:
    "Daily queer news feed with LGBTQ world updates, travel safety signals, inclusive nightlife shifts, and community policy watch across major cities.",
  keywords: [
    "queer news",
    "LGBTQ news",
    "gay news today",
    "queer community news",
    "LGBTQ travel news",
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
    title: "Queer News Feed | Queer Atlas",
    description:
      "Track LGBTQ world news, queer travel safety, nightlife changes, and policy shifts in one live editorial feed.",
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
    title: "Queer News Feed | Queer Atlas",
    description:
      "Daily LGBTQ world news, queer travel safety updates, nightlife shifts, and policy watch.",
    images: ["/queer-atlas-heart-logo-progress.png"],
  },
};

export default function NowLayout({ children }) {
  return children;
}
