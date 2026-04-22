export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    host: "https://www.queeratlas.app",
    sitemap: "https://www.queeratlas.app/sitemap.xml",
  };
}

