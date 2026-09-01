import NearbyPageClient from "./NearbyPageClient";

export const metadata = {
  title: "Nearby | Queer Atlas",
  description: "Find nearby queer venues and upcoming events.",
  robots: { index: false, follow: false },
};

export default function NearbyPage() {
  return <NearbyPageClient />;
}
