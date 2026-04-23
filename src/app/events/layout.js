import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Queer Events Calendar",
  description:
    "Track public queer events and curated city-level happenings with live community signal.",
  keywords: [
    keywordOwnership.events.primary,
    ...keywordOwnership.events.secondary,
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Queer Events | Queer Atlas",
    description:
      "Find upcoming queer events, city highlights, and off-grid signal in one timeline.",
    url: "/events",
    type: "website",
  },
};

export default function EventsLayout({ children }) {
  return children;
}
