export const metadata = {
  title: "Cities",
  description:
    "Explore queer city guides with verified venues, events, and local signal across the Queer Atlas network.",
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
