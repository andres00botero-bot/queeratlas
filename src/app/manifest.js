export default function manifest() {
  return {
    name: "Queer Atlas",
    short_name: "Queer Atlas",
    description:
      "Global queer discovery atlas for venues, events, guides, and member community signal.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#111111",
    categories: ["travel", "lifestyle", "community"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
