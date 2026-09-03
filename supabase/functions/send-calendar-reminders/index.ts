import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = { "content-type": "application/json" };

Deno.serve(async (request) => {
  const expectedSecret = Deno.env.get("CALENDAR_REMINDER_CRON_SECRET") || "";
  if (!expectedSecret || request.headers.get("authorization") !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const vapidPublicKey = Deno.env.get("WEB_PUSH_VAPID_PUBLIC_KEY") || "";
  const vapidPrivateKey = Deno.env.get("WEB_PUSH_VAPID_PRIVATE_KEY") || "";
  const vapidSubject = Deno.env.get("WEB_PUSH_VAPID_SUBJECT") || "mailto:hello@queeratlas.app";
  if (!supabaseUrl || !serviceKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ ok: false, error: "Missing calendar reminder environment variables" }), { status: 500, headers: corsHeaders });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const dueBefore = new Date().toISOString();
  const { data: reminders, error } = await supabase
    .from("member_calendar_reminders")
    .select("id,user_id,entry_client_id,mode,scheduled_for,attempt_count")
    .eq("status", "pending")
    .lte("scheduled_for", dueBefore)
    .order("scheduled_for", { ascending: true })
    .limit(100);

  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: corsHeaders });

  let sent = 0;
  let failed = 0;
  for (const reminder of reminders || []) {
    const { data: claimed } = await supabase
      .from("member_calendar_reminders")
      .update({ status: "sending", attempt_count: Number(reminder.attempt_count || 0) + 1, updated_at: new Date().toISOString() })
      .eq("id", reminder.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    const { data: subscriptions } = await supabase
      .from("member_push_subscriptions")
      .select("id,endpoint,p256dh,auth_key")
      .eq("user_id", reminder.user_id)
      .eq("active", true);
    const { data: entry } = await supabase
      .from("member_calendar_entries")
      .select("title,city,date_key,time_value,status")
      .eq("user_id", reminder.user_id)
      .eq("client_id", reminder.entry_client_id)
      .maybeSingle();
    const payload = JSON.stringify({
      title: "QueerAtlas reminder",
      body: entry?.title ? `${entry.title}${entry.city ? ` · ${entry.city}` : ""}` : "You have a plan coming up.",
      tag: `calendar-${reminder.id}`,
      url: "/favorites?tab=calendar",
    });

    let delivered = false;
    let lastError = "No active push subscription";
    for (const subscription of subscriptions || []) {
      try {
        await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } }, payload);
        delivered = true;
      } catch (pushError) {
        lastError = String(pushError?.message || pushError);
        if (pushError?.statusCode === 404 || pushError?.statusCode === 410) {
          await supabase.from("member_push_subscriptions").update({ active: false, updated_at: new Date().toISOString() }).eq("id", subscription.id);
        }
      }
    }

    await supabase.from("member_calendar_reminders").update(delivered
      ? { status: "sent", delivered_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() }
      : { status: "failed", last_error: lastError.slice(0, 500), updated_at: new Date().toISOString() }
    ).eq("id", reminder.id);
    if (delivered) sent += 1;
    else failed += 1;
  }

  return new Response(JSON.stringify({ ok: true, processed: (reminders || []).length, sent, failed }), { headers: corsHeaders });
});
