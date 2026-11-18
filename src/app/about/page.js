import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";
import { getAtlasInventory } from "@/lib/atlasMetrics";

export const metadata = buildTrustMetadata("about");

export default async function AboutPage() {
  const { metrics } = await getAtlasInventory();

  return <TrustPage pageKey="about" metrics={metrics} />;
}
