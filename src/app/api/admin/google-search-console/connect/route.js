import { NextResponse } from "next/server";
import { buildGoogleAuthorizationUrl, createOauthState, getGscRedirectUri } from "@/lib/googleSearchConsole/server";
import { hasAuthorizedSeoAdminRequest } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const state = createOauthState();
    const redirectUri = getGscRedirectUri(request);
    const response = NextResponse.json({
      ok: true,
      authorizationUrl: buildGoogleAuthorizationUrl({ redirectUri, state }),
    });
    response.cookies.set("qa_gsc_oauth_state", state, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: new URL(redirectUri).pathname,
      maxAge: 600,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "oauth-start-failed" }, { status: 500 });
  }
}
