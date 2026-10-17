import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { getEntityLifecycle, normalizeLifecyclePath } from "@/lib/server/entityLifecycle";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/seo/localizedSeo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Page Not Found | Queer Atlas",
  robots: { index: false, follow: true },
};

export default async function LegacyPathPage({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const resolved = await params;
  const sourcePath = normalizeLifecyclePath((resolved?.legacyPath || []).join("/"));
  const lifecycle = await getEntityLifecycle(sourcePath);

  if (lifecycle?.lifecycleStatus === "redirected") {
    permanentRedirect(localePath(lifecycle.destinationPath, locale));
  }

  notFound();
}
