export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/favorites", "/contribute", "/community"],
      },
    ],
    host: "https://queeratlas.app",
    sitemap: "https://queeratlas.app/sitemap.xml",
  };
}
