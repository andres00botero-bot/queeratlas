"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

function decodeVapidPublicKey(value = "") {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64 + padding);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function MessagePushControl({ compact = false }) {
  const { user } = useAuth();
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const [status, setStatus] = useState(() => typeof Notification === "undefined" ? "idle" : Notification.permission === "granted" ? "enabled" : Notification.permission === "denied" ? "denied" : "idle");

  const enable = async () => {
    const key = String(process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || "").trim();
    if (!key || !user?.id || !supported) { setStatus("unavailable"); return; }
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeVapidPublicKey(key) });
      const json = subscription.toJSON();
      const { error } = await supabase.from("member_push_subscriptions").upsert({ user_id: user.id, endpoint: subscription.endpoint, p256dh: String(json.keys?.p256dh || ""), auth_key: String(json.keys?.auth || ""), user_agent: navigator.userAgent, active: true, updated_at: new Date().toISOString() }, { onConflict: "user_id,endpoint" });
      if (error) throw error;
      setStatus("enabled");
    } catch { setStatus("error"); }
  };

  if (status === "enabled") return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#80D4C4] ${compact ? "" : "rounded-xl border border-[#80D4C4]/25 px-3 py-2"}`}><BellRing className="h-4 w-4" />Alerts on</span>;
  return <button type="button" onClick={enable} disabled={status === "loading" || status === "denied" || status === "unavailable"} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#80D4C4]/28 px-3 text-xs font-semibold text-[#80D4C4] disabled:opacity-55 ${compact ? "" : "bg-[#80D4C4]/[.06]"}`}><Bell className="h-4 w-4" />{status === "loading" ? "Enabling…" : status === "denied" ? "Alerts blocked" : status === "unavailable" ? "Alerts unavailable" : "Enable message alerts"}</button>;
}
