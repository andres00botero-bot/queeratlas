import { localizedAlternates, localizedOpenGraphUrl, openGraphLocale } from "@/lib/seo/localizedSeo";

export const DEFAULT_SOCIAL_IMAGE = Object.freeze({
  url: "/queer-atlas-logo.png",
  width: 1024,
  height: 1024,
  alt: "Queer Atlas",
});

/** Build consistent canonical, Open Graph and X/Twitter metadata for public pages. */
export function createPageMetadata({ path, locale, title, description, type = "website", image = DEFAULT_SOCIAL_IMAGE }) {
  const imageValue = { ...DEFAULT_SOCIAL_IMAGE, ...image };
  return {
    title,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: { title, description, url: localizedOpenGraphUrl(path, locale), locale: openGraphLocale(locale), type, images: [imageValue] },
    twitter: { card: "summary_large_image", title, description, images: [imageValue.url] },
  };
}
