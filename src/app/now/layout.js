export const metadata = {
  title: "Queer World News & Live Updates",
  description:
    "Real-time queer world news, LGBTQ travel safety signals, and safe queer nightlife updates across cities.",
  keywords: [
    "LGBTQ safety map",
    "LGBTQ travel safety",
    "safe queer nightlife",
    "queer safe spaces",
    "inclusive nightlife",
  ],
  alternates: {
    canonical: "/now",
  },
  openGraph: {
    title: "Queer World News | Queer Atlas",
    description:
      "Follow LGBTQ safety updates, queer nightlife changes, and live city momentum.",
    url: "/now",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LGBTQ Safety & Live Queer Updates | Queer Atlas",
    description:
      "Live LGBTQ safety map signals, nightlife updates, and city trend shifts.",
  },
};

export default function NowLayout({ children }) {
  return children;
}
