import ContributorDirectory from "@/components/editorial/ContributorDirectory";
import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("contributors");

export const revalidate = 600;

export default function ContributorsPage() {
  return (
    <TrustPage pageKey="contributors">
      <ContributorDirectory />
    </TrustPage>
  );
}
