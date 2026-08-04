import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("contributors");

export default function ContributorsPage() {
  return <TrustPage pageKey="contributors" />;
}
