import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";

const metadata = {
  title: "Queer News, Rankings & Atlas Collections",
  description:
    "Daily queer news plus Queer Safety Index, Top Queer Destinations rankings, and Atlas Collections for LGBTQ nightlife, beaches, drag venues, lesbian bars, and hidden cafes.",
  keywords: [
    "queer news",
    "LGBTQ news",
    "gay news today",
    "queer community news",
    "LGBTQ travel news",
    "queer safety index",
    "top queer destinations",
    "LGBTQ city rankings",
    "queer travel safety",
    "safe queer nightlife",
    "inclusive nightlife",
    "LGBTQ policy updates",
    "queer rights news",
    "LGBTQ events news",
    "queer city updates",
    "best queer techno clubs",
    "best queer beaches",
    "lesbian bars Europe",
    "best drag venues",
    "hidden queer cafes",
    "queer travel collections",
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
    title: "Queer News, Rankings & Atlas Collections | Queer Atlas",
    description:
      "Track queer world news, Top Queer Destinations, Queer Safety Index rankings, and curated Atlas Collections for LGBTQ travel discovery.",
    url: "/now",
    type: "website",
    images: [
      {
        url: "/queer-atlas-logo.png",
        width: 1024,
        height: 1024,
        alt: "Queer Atlas Now - queer news feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer News, Rankings & Atlas Collections | Queer Atlas",
    description:
      "Daily queer news with rankings and curated Atlas Collections for queer nightlife, beaches, drag venues, lesbian bars, and hidden cafes.",
    images: ["/queer-atlas-logo.png"],
  },
};

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-qa-locale"));
  if (locale !== "es") return { ...metadata, alternates: localizedAlternates("/now", locale), openGraph: { ...metadata.openGraph, url: localizedOpenGraphUrl("/now", locale), locale: "en_US" } };

  return {
    ...metadata,
    alternates: localizedAlternates("/now", locale),
    title: "Noticias queer, clasificaciones y colecciones Atlas",
    description: "Noticias queer diarias, el Índice de seguridad queer, clasificaciones de destinos y colecciones Atlas para vida nocturna, playas, drag, bares lésbicos y cafeterías LGBTQ.",
    openGraph: {
      ...metadata.openGraph,
      url: localizedOpenGraphUrl("/now", locale),
      locale: "es_ES",
      title: "Noticias queer, clasificaciones y colecciones Atlas | Queer Atlas",
      description: "Sigue las noticias queer del mundo, las clasificaciones de destinos y seguridad, y las colecciones Atlas seleccionadas para descubrir viajes LGBTQ.",
      images: metadata.openGraph.images.map((image) => ({ ...image, alt: "Queer Atlas Now - noticias queer" })),
    },
    twitter: {
      ...metadata.twitter,
      title: "Noticias queer, clasificaciones y colecciones Atlas | Queer Atlas",
      description: "Noticias queer diarias con clasificaciones y colecciones Atlas seleccionadas para vida nocturna, playas, drag, bares lésbicos y cafeterías.",
    },
  };
}

export default function NowLayout({ children }) {
  return children;
}
