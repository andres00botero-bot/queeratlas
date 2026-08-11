export const QA_SITE_URL = "https://www.queeratlas.app";
export const QA_WEBSITE_ID = `${QA_SITE_URL}/#website`;
export const QA_ORGANIZATION_ID = `${QA_SITE_URL}/#organization`;
export const QA_ORGANIZATION_NAME = "Queer Atlas";
export const QA_LOGO_URL = `${QA_SITE_URL}/icons/qa-logo-512.png`;

const QA_PRIMARY_HUB_PATHS = [
  "/",
  "/cities",
  "/events",
  "/now",
  "/gay-guide",
  "/queer-guide",
  "/hbtq-guide",
  "/about",
  "/editorial-policy",
  "/verification",
  "/sources-and-reviews",
  "/community-policy",
  "/corrections",
  "/contributors",
  "/contact",
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
        description:
          "Independent queer travel, nightlife, event, and community guidance with transparent editorial standards.",
        email: "admin@queeratlas.app",
        logo: {
          "@type": "ImageObject",
          url: QA_LOGO_URL,
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "editorial, corrections and press",
          email: "admin@queeratlas.app",
          url: `${QA_SITE_URL}/contact`,
          availableLanguage: ["English", "Swedish"],
        },
        publishingPrinciples: `${QA_SITE_URL}/editorial-policy`,
        ethicsPolicy: `${QA_SITE_URL}/editorial-policy`,
        correctionsPolicy: `${QA_SITE_URL}/corrections`,
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
        publishingPrinciples: `${QA_SITE_URL}/editorial-policy`,
        hasPart: QA_PRIMARY_HUB_PATHS.map((path) => toAbsoluteUrl(path)),
      },
    ],
  };
}
