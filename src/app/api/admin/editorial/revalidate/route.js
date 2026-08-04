import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAuthorizedSeoAdminRequest } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";

function normalizePaths(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .map((item) => String(item || "").trim())
      .filter((item) => item.startsWith("/") && !item.startsWith("//") && item.length <= 240),
  )].slice(0, 50);
}

export async function POST(request) {
  if (!(await hasAuthorizedSeoAdminRequest(request))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const paths = normalizePaths(body?.paths);
  if (paths.length === 0) {
    return NextResponse.json({ ok: false, error: "no-valid-paths" }, { status: 400 });
  }

  for (const path of paths) revalidatePath(path);
  return NextResponse.json({ ok: true, revalidated: paths });
}
