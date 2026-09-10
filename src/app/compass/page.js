import { permanentRedirect } from "next/navigation";

export default function LegacyCompassPage() {
  permanentRedirect("/dictionary");
}
