export const metadata = {
  title: "Queer World News & Live Updates",
  description:
    "Real-time queer world news and momentum updates across cities in the Queer Atlas network.",
  alternates: {
    canonical: "/now",
  },
  openGraph: {
    title: "Queer World News | Queer Atlas",
    description:
      "Follow fresh queer world updates, city momentum, and live community signal.",
    url: "/now",
    type: "website",
  },
};

export default function NowLayout({ children }) {
  return children;
}
