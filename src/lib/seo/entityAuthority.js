export const QA_SITE_URL = "https://www.queeratlas.app";
export const QA_WEBSITE_ID = `${QA_SITE_URL}/#website`;
export const QA_ORGANIZATION_ID = `${QA_SITE_URL}/#organization`;
export const QA_ORGANIZATION_NAME = "Queer Atlas";
export const QA_LOGO_URL = `${QA_SITE_URL}/icons/icon-512.png`;

const QA_PRIMARY_HUB_PATHS = [
  "/",
  "/cities",
  "/events",
  "/now",
  "/gay-guide",
  "/queer-guide",
  "/hbtq-guide",
];

function toAbsoluteUrl(path = "") {
  return `${QA_SITE_URL}${path}`;
}

export function buildPrimaryEntityGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": QA_ORGANIZATION_ID,
        name: QA_ORGANIZATION_NAME,
        url: QA_SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: QA_LOGO_URL,
        },
      },
      {
        "@type": "WebSite",
        "@id": QA_WEBSITE_ID,
        name: QA_ORGANIZATION_NAME,
        url: QA_SITE_URL,
        inLanguage: "en",
        publisher: {
          "@id": QA_ORGANIZATION_ID,
        },
        hasPart: QA_PRIMARY_HUB_PATHS.map((path) => toAbsoluteUrl(path)),
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${QA_SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
