export const metadata = {
  title: "Global Search",
  description:
    "Search queer-friendly cities, venues, and events with live intent-aware results and map discovery.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/search",
  },
  keywords: [
    "queer search",
    "LGBTQ events search",
    "queer-friendly places",
    "safe queer nightlife",
    "queer travel discovery",
  ],
  openGraph: {
    title: "Queer Atlas Global Search",
    description:
      "Discover queer bars, events, safe spaces, and city signal in one intelligent global search.",
    url: "https://www.queeratlas.app/search",
    type: "website",
    images: [
      {
        url: "/images/explore-global-search.png",
        width: 1536,
        height: 1024,
        alt: "Queer Atlas Global Search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Atlas Global Search",
    description:
      "Search queer cities, places, and events with trusted signal and live discovery.",
    images: ["/images/explore-global-search.png"],
  },
};

export default function SearchLayout({ children }) {
  return children;
}
