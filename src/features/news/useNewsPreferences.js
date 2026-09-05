"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "qa_news_preferences_v1";
const CLOUD_SYNC_KEY = "qa_news_preferences_cloud_synced_v1";
const CHANGE_EVENT = "qa:news-preferences-changed";

function preferenceKey(item) {
  return `${String(item?.preferenceType || item?.preference_type || "")}::${String(item?.targetId || item?.target_id || "")}`;
}

function normalizePreference(item) {
  return {
    preferenceType: String(item?.preferenceType || item?.preference_type || "").trim(),
    targetId: String(item?.targetId || item?.target_id || "").trim(),
    metadata: item?.metadata && typeof item.metadata === "object" ? item.metadata : {},
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
  };
}

function normalizePreferences(items) {
  const unique = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const normalized = normalizePreference(item);
    if (!normalized.preferenceType || !normalized.targetId) return;
    unique.set(preferenceKey(normalized), normalized);
  });
  return [...unique.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function localStorageKey(userId) {
  return `${STORAGE_KEY}:${String(userId || "guest")}`;
}

function readLocalPreferences(userId) {
  if (typeof window === "undefined") return [];
  try {
    return normalizePreferences(JSON.parse(localStorage.getItem(localStorageKey(userId)) || "[]"));
  } catch {
    return [];
  }
}

function writeLocalPreferences(items, userId) {
  if (typeof window === "undefined") return;
  const normalized = normalizePreferences(items);
  localStorage.setItem(localStorageKey(userId), JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { userId, items: normalized } }));
}

function isMissingPreferencesTable(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || (message.includes("member_news_preferences") && message.includes("schema cache"));
}

export default function useNewsPreferences({ enabled = true } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMember, isLoading: isAuthLoading, user } = useAuth();
  const userId = user?.id || "";
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [cloudAvailable, setCloudAvailable] = useState(true);

  useEffect(() => {
    if (!enabled || isAuthLoading) return;
    queueMicrotask(() => {
      setPreferences(isMember && userId ? readLocalPreferences(userId) : []);
      setLoading(false);
    });
    const onChange = (event) => {
      if (String(event.detail?.userId || "") !== userId) return;
      setPreferences(normalizePreferences(event.detail?.items || readLocalPreferences(userId)));
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [enabled, isAuthLoading, isMember, userId]);

  useEffect(() => {
    if (!enabled || isAuthLoading || !isMember || !userId) return;
    let active = true;
    queueMicrotask(async () => {
      const local = readLocalPreferences(userId);
      const { data, error } = await supabase
        .from("member_news_preferences")
        .select("preference_type,target_id,metadata,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setCloudAvailable(!isMissingPreferencesTable(error));
        setPreferences(local);
        setLoading(false);
        return;
      }

      const remote = normalizePreferences(data || []);
      const syncMarker = `${CLOUD_SYNC_KEY}:${userId}`;
      const hasCompletedInitialSync = localStorage.getItem(syncMarker) === "1";
      const merged = hasCompletedInitialSync ? remote : normalizePreferences([...remote, ...local]);
      setPreferences(merged);
      writeLocalPreferences(merged, userId);
      setCloudAvailable(true);
      setLoading(false);

      const remoteKeys = new Set(remote.map(preferenceKey));
      const missing = hasCompletedInitialSync ? [] : merged.filter((item) => !remoteKeys.has(preferenceKey(item)));
      if (missing.length > 0) {
        await supabase.from("member_news_preferences").upsert(
          missing.map((item) => ({
            user_id: userId,
            preference_type: item.preferenceType,
            target_id: item.targetId,
            metadata: item.metadata,
            created_at: item.createdAt,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "user_id,preference_type,target_id" }
        );
      }
      localStorage.setItem(syncMarker, "1");
    });
    return () => {
      active = false;
    };
  }, [enabled, isAuthLoading, isMember, userId]);

  const requestSignIn = useCallback(() => {
    if (typeof window !== "undefined") {
      const target = pathname || "/now/news";
      localStorage.setItem("qa_redirect", target);
      localStorage.setItem("qa_post_login_target", target);
    }
    router.push("/?join=true");
  }, [pathname, router]);

  const togglePreference = useCallback(async ({ preferenceType, targetId, metadata = {} }) => {
    const normalized = normalizePreference({ preferenceType, targetId, metadata, createdAt: new Date().toISOString() });
    if (!normalized.preferenceType || !normalized.targetId) return { ok: false };
    if (!isMember || !userId) {
      requestSignIn();
      return { ok: false, requiresSignIn: true };
    }

    const key = preferenceKey(normalized);
    const current = readLocalPreferences(userId);
    const exists = current.some((item) => preferenceKey(item) === key);
    const next = exists ? current.filter((item) => preferenceKey(item) !== key) : normalizePreferences([normalized, ...current]);
    setPreferences(next);
    writeLocalPreferences(next, userId);

    const query = supabase.from("member_news_preferences");
    const { error } = exists
      ? await query.delete().eq("user_id", userId).eq("preference_type", normalized.preferenceType).eq("target_id", normalized.targetId)
      : await query.upsert({
          user_id: userId,
          preference_type: normalized.preferenceType,
          target_id: normalized.targetId,
          metadata: normalized.metadata,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,preference_type,target_id" });

    if (error) setCloudAvailable(!isMissingPreferencesTable(error));
    return { ok: !error, active: !exists, localOnly: Boolean(error) };
  }, [isMember, requestSignIn, userId]);

  const preferenceSet = useMemo(() => new Set(preferences.map(preferenceKey)), [preferences]);
  const hasPreference = useCallback((preferenceType, targetId) => preferenceSet.has(`${preferenceType}::${targetId}`), [preferenceSet]);

  return {
    preferences,
    loading,
    cloudAvailable,
    isMember,
    hasPreference,
    requestSignIn,
    togglePreference,
  };
}
