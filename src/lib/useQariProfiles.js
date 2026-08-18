import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { logDevError } from "./devLogger";
import { normalizeQariProfile } from "./qari";
import { QARI_PILOT_PROFILES } from "./qariPilotProfiles";

export function useQariProfiles() {
  const [databaseProfiles, setDatabaseProfiles] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [{ data: profiles, error: profileError }, { data: sources, error: sourceError }] =
          await Promise.all([
            supabase
              .from("qa_qari_profiles")
              .select("destination_key, scope_type, country, city_key, legal_risk, social_risk, digital_risk, risk_floor, qari_score, confidence, summary, methodology_version, reviewed_at, updated_at")
              .eq("is_published", true),
            supabase
              .from("qa_qari_sources")
              .select("destination_key, axis, label, url, checked_at")
              .order("axis", { ascending: true }),
          ]);

        if (!active) return;
        const missingTable = [profileError, sourceError].some((error) => {
          const message = String(error?.message || "").toLowerCase();
          return message.includes("does not exist") || message.includes("schema cache");
        });

        if (missingTable) {
          setDatabaseProfiles([]);
          setLoadError("");
          return;
        }
        if (profileError || sourceError) throw profileError || sourceError;

        const sourcesByDestination = (Array.isArray(sources) ? sources : []).reduce((map, source) => {
          const key = String(source.destination_key || "");
          if (!map[key]) map[key] = [];
          map[key].push(source);
          return map;
        }, {});

        setDatabaseProfiles(
          (Array.isArray(profiles) ? profiles : [])
            .map((profile) => normalizeQariProfile({
              ...profile,
              sources: sourcesByDestination[profile.destination_key] || [],
            }))
            .filter(Boolean),
        );
        setLoadError("");
      } catch (error) {
        if (!active) return;
        logDevError("QARI profiles query error:", error);
        setDatabaseProfiles([]);
        setLoadError("Could not load live QARI profiles.");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const profiles = useMemo(() => {
    const merged = new Map(QARI_PILOT_PROFILES.map((profile) => [profile.destinationKey, profile]));
    databaseProfiles.forEach((profile) => merged.set(profile.destinationKey, profile));
    return Array.from(merged.values());
  }, [databaseProfiles]);

  const byCountry = useMemo(() => Object.fromEntries(
    profiles
      .filter((profile) => profile.scopeType === "country" && profile.country)
      .map((profile) => [profile.country.toLowerCase(), profile]),
  ), [profiles]);

  return { profiles, byCountry, loadError };
}
