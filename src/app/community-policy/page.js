import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("community-policy");

export default function CommunityPolicyPage() {
  return <TrustPage pageKey="community-policy" />;
}
