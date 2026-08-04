import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("corrections");

export default function CorrectionsPage() {
  return <TrustPage pageKey="corrections" />;
}
