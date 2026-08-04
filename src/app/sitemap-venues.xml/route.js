import { getVenueSitemapEntries } from "@/lib/seo/sitemapEntries";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import { buildUrlSetXml, sitemapUnavailableResponse, xmlResponse } from "@/lib/seo/sitemapXml";

export const dynamic = "force-dynamic";

export async function GET() {
  const inventory = await loadSeoEntityInventory();
  if (!inventory.availability.places) return sitemapUnavailableResponse();
  return xmlResponse(buildUrlSetXml(await getVenueSitemapEntries()));
}
