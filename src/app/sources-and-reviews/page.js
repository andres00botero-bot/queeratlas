import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("sources-and-reviews");

export default function SourcesAndReviewsPage() {
  return <TrustPage pageKey="sources-and-reviews" />;
}
