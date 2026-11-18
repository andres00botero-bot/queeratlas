import HomeContactSection from "@/components/home/HomeContactSection";
import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("contact");

export default function ContactPage() {
  return (
    <TrustPage pageKey="contact">
      <HomeContactSection
        className="border-b border-white/10 py-8 sm:py-10"
        pageContext="/contact"
        embedded
      />
    </TrustPage>
  );
}
