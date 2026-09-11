import { NextResponse } from "next/server";
import { exchangeAuthorizationCode, getGscRedirectUri, safeStateEqual, saveGoogleConnection } from "@/lib/googleSearchConsole/server";

export const dynamic = "force-dynamic";

function adminRedirect(request, status, detail = "") {
  const url = new URL("/admin/seo-observability", request.url);
  url.searchParams.set("gsc", status);
  if (detail) url.searchParams.set("detail", detail.slice(0, 160));
  const response = NextResponse.redirect(url);
  response.cookies.set("qa_gsc_oauth_state", "", {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: request.nextUrl.pathname,
    maxAge: 0,
  });
  return response;
}

export async function GET(request) {
  const code = String(request.nextUrl.searchParams.get("code") || "").trim();
  const state = String(request.nextUrl.searchParams.get("state") || "").trim();
  const error = String(request.nextUrl.searchParams.get("error") || "").trim();
  const cookieState = String(request.cookies.get("qa_gsc_oauth_state")?.value || "");
  if (error) return adminRedirect(request, "error", error);
  if (!code || !safeStateEqual(state, cookieState)) return adminRedirect(request, "error", "invalid-oauth-state");
  try {
    const tokenPayload = await exchangeAuthorizationCode({ code, redirectUri: getGscRedirectUri(request) });
    await saveGoogleConnection({ tokenPayload });
    return adminRedirect(request, "connected");
  } catch (caught) {
    return adminRedirect(request, "error", caught?.message || "oauth-callback-failed");
  }
}
