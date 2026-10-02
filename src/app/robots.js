export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Keep ChatGPT Search eligible even if a future general crawler rule is restricted.
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
    ],
    host: "https://www.queeratlas.app",
    sitemap: "https://www.queeratlas.app/sitemap.xml",
  };
}

