"use client";

import { supabase } from "@/lib/supabase";

export const PRIVACY_CHANGED = "qa:privacy-changed";
export async function privacyCall(name, args = {}) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error("privacy_unavailable")); }, 10000);
  });
  try {
    const { data, error } = await Promise.race([
      supabase.rpc(`qa_privacy_${name}`, args).abortSignal(controller.signal), deadline,
    ]);
    if (error) throw new Error(String(error.message || "privacy_unavailable"));
    return data;
  } finally { clearTimeout(timer); }
}
export function privacyChanged() {
  window.dispatchEvent(new Event(PRIVACY_CHANGED));
}
export async function privateAvatar(path) {
  if (!path || /^https?:|^data:/i.test(path)) return "";
  const { data, error } = await supabase.storage.from("member-avatars").createSignedUrl(path, 30);
  return error ? "" : data?.signedUrl || "";
}
