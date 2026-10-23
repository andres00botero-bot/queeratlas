import { createAdminMembersHandlers } from "@/lib/adminMembersServer";
import { getAuthorizedSeoAdminUser, getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";
const handlers = createAdminMembersHandlers({
  authorize: getAuthorizedSeoAdminUser,
  getService: getTelemetryServiceClient,
});
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
