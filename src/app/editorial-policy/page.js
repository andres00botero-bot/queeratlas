import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("editorial-policy");

export default function EditorialPolicyPage() {
  return <TrustPage pageKey="editorial-policy" />;
}
