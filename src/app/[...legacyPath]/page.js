import { notFound, permanentRedirect } from "next/navigation";
import { getEntityLifecycle, normalizeLifecyclePath } from "@/lib/server/entityLifecycle";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Page Not Found | Queer Atlas",
  robots: { index: false, follow: true },
};

export default async function LegacyPathPage({ params }) {
  const resolved = await params;
  const sourcePath = normalizeLifecyclePath((resolved?.legacyPath || []).join("/"));
  const lifecycle = await getEntityLifecycle(sourcePath);

  if (lifecycle?.lifecycleStatus === "redirected") {
    permanentRedirect(lifecycle.destinationPath);
  }

  notFound();
}
