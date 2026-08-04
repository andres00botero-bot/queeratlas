import HomeContactSection from "@/components/home/HomeContactSection";
import TrustPage from "@/components/editorial/TrustPage";
import { buildTrustMetadata } from "@/lib/editorialTrust";

export const metadata = buildTrustMetadata("contact");

export default function ContactPage() {
  return (
    <TrustPage pageKey="contact">
      <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-6">
        <HomeContactSection className="mt-0" pageContext="/contact" />
      </div>
    </TrustPage>
  );
}
