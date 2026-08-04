import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("about");

export default function AboutPage() {
  return <TrustPage pageKey="about" />;
}
