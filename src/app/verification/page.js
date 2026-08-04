import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("verification");

export default function VerificationPage() {
  return <TrustPage pageKey="verification" />;
}
