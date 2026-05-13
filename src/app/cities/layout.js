import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Gay Travel Cities",
  description:
    "Explore gay friendly cities, safer city picks for LGBTQ travelers, and verified queer venues, events, and local signal.",
  keywords: [
    keywordOwnership.cities.primary,
    ...keywordOwnership.cities.secondary,
    "queer neighborhoods",
    "queer friendly places",
    "LGBTQ travel safety",
  ],
  alternates: {
    canonical: "/cities",
  },
  openGraph: {
    title: "Queer Cities | Queer Atlas",
    description:
      "Compare gay-friendly cities, queer-safe areas, and trusted LGBTQ nightlife signal.",
    url: "/cities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gay Friendly Cities | Queer Atlas",
    description:
      "Explore safer queer travel cities, local nightlife context, and trusted venue signal.",
  },
};

export default function CitiesLayout({ children }) {
  return children;
}
