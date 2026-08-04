import { getPageSitemapEntries } from "@/lib/seo/sitemapEntries";
import { buildUrlSetXml, xmlResponse } from "@/lib/seo/sitemapXml";

export const dynamic = "force-dynamic";

export async function GET() {
  return xmlResponse(buildUrlSetXml(await getPageSitemapEntries()));
}
