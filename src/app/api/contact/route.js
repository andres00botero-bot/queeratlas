import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_CATEGORIES = new Set([
  "bug_report",
  "safety_concern",
  "venue_event_correction",
  "general_feedback",
  "business_inquiry",
]);

function mapPriority(category) {
  if (category === "safety_concern") return "urgent";
  if (category === "business_inquiry") return "high";
  return "normal";
}

function trimString(value, maxLength = 10000) {
  return String(value || "").trim().slice(0, maxLength);
}

function createReference(id) {
  const compact = String(id || "").replace(/-/g, "");
  return `QA-${compact.slice(0, 8).toUpperCase()}`;
}

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing for /api/contact.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const category = trimString(body?.category, 64);
    const subject = trimString(body?.subject, 140);
    const message = trimString(body?.message, 5000);
    const senderEmail = trimString(body?.senderEmail, 180);
    const senderName = trimString(body?.senderName, 120);
    const cityContext = trimString(body?.cityContext, 120);
    const pageContext = trimString(body?.pageContext, 180) || "/home";
    const isAnonymous = Boolean(body?.isAnonymous);
    const userId = trimString(body?.userId, 80) || null;

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { ok: false, error: "Invalid category." },
        { status: 400 }
      );
    }

    if (!subject || subject.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Subject is required." },
        { status: 400 }
      );
    }

    if (!message || message.length < 20) {
      return NextResponse.json(
        { ok: false, error: "Message must be at least 20 characters." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const payload = {
      status: "new",
      priority: mapPriority(category),
      category,
      subject,
      message,
      is_anonymous: isAnonymous,
      user_id: isAnonymous ? null : userId,
      sender_name: isAnonymous ? null : senderName || null,
      sender_email: isAnonymous ? null : senderEmail || null,
      city_context: cityContext || null,
      page_context: pageContext,
      meta: {
        source: "home_contact",
      },
    };

    const { data, error } = await supabase
      .from("contact_threads")
      .insert([payload])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Could not send message." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: data?.id || null,
      reference: createReference(data?.id),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
