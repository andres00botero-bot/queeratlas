import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Gay Travel Cities",
  description:
    "Explore queer city guides with verified venues, events, and local signal across the Queer Atlas network.",
  keywords: [
    keywordOwnership.cities.primary,
    ...keywordOwnership.cities.secondary,
  ],
  alternates: {
    canonical: "/cities",
  },
  openGraph: {
    title: "Queer Cities | Queer Atlas",
    description:
      "Discover queer city guides, trusted venues, and local event signal worldwide.",
    url: "/cities",
    type: "website",
  },
};

export default function CitiesLayout({ children }) {
  return children;
}
