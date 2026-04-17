export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/contribute", "/community"],
      },
    ],
    host: "https://www.queeratlas.app",
    sitemap: "https://www.queeratlas.app/sitemap.xml",
  };
}

