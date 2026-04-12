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
        src: "/queer-atlas-heart-logo-progress.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
