import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Gay Friendly Cities & LGBTQ Safety Map 2026",
  description:
    "Compare gay friendly cities, queer-safe areas, and LGBTQ nightlife signal with legal-rights-safety context for smarter travel decisions.",
  keywords: [
    keywordOwnership.cities.primary,
    ...keywordOwnership.cities.secondary,
    "queer neighborhoods",
    "queer friendly places",
    "LGBTQ travel safety",
    "gay friendly cities 2026",
    "queer safe areas map",
  ],
  alternates: {
    canonical: "/cities",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Gay Friendly Cities & LGBTQ Safety Map 2026 | Queer Atlas",
    description:
      "Compare queer city safety context, nightlife signal, and trusted local routes in one city-by-city atlas.",
    url: "/cities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gay Friendly Cities & LGBTQ Safety Map 2026 | Queer Atlas",
    description:
      "Explore safer queer travel cities, local nightlife context, and trusted venue signal.",
  },
};

export default function CitiesLayout({ children }) {
  return children;
}
