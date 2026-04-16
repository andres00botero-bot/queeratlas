export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/contribute", "/community"],
      },
    ],
    host: "https://queeratlas.app",
    sitemap: "https://queeratlas.app/sitemap.xml",
  };
}
