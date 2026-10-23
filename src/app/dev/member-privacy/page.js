import { notFound } from "next/navigation";
import MemberPrivacySettings from "@/components/community/MemberPrivacy";

export const metadata = { robots: { index: false, follow: false } };
export default function MemberPrivacyDesignPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const preview = { version: 1, eligible: true, directory_open: true, profile: {
    user_id: "design-preview", audience: "community", alias: "AtlasFox", bio: "Art, coffee and new city walks.",
    discovery_city: "Barcelona", share_city: true, shared_pronouns: "", share_pronouns: false,
    share_avatar: false, joined_at: "2026-10-23T00:00:00Z",
  }, contacts: [], blocks: [] };
  return <main className="min-h-screen bg-[#0B1220] px-4 py-8 pb-28 text-[#F5F1E8]"><div className="mx-auto max-w-5xl"><p className="mb-4 text-xs text-[#F2B38B]">Design preview · synthetic data · changes are not saved</p><MemberPrivacySettings previewState={preview} /></div></main>;
}
