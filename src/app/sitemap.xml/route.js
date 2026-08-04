import { buildSitemapIndexXml, xmlResponse } from "@/lib/seo/sitemapXml";

export const dynamic = "force-dynamic";

export async function GET() {
  return xmlResponse(buildSitemapIndexXml([
    "/sitemap-pages.xml",
    "/sitemap-venues.xml",
    "/sitemap-events.xml",
    "/sitemap-services.xml",
  ]));
}
