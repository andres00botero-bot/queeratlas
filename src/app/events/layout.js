import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Queer Events Calendar",
  description:
    "Track LGBTQ events, queer nightlife events, and curated city-level happenings with live community signal.",
  keywords: [
    keywordOwnership.events.primary,
    ...keywordOwnership.events.secondary,
    "LGBTQ nightlife",
    "inclusive nightlife",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Queer Events | Queer Atlas",
    description:
      "Find LGBTQ events, queer nightlife calendars, and city-by-city event momentum.",
    url: "/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LGBTQ Events Calendar | Queer Atlas",
    description:
      "Track queer nightlife events, city highlights, and inclusive event signal.",
  },
};

export default function EventsLayout({ children }) {
  return children;
}
