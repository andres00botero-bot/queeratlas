import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { logDevError } from "./devLogger";

export function useCountryRightsProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function run() {
      setIsLoading(true);
      setLoadError("");

      try {
        const { data, error } = await supabase
          .from("qa_country_rights_profiles")
          .select(
            "country, legal_level, rights_level, safety_level, same_sex_relations_status, union_status, legal_gender_recognition_status, anti_discrimination_status, what_this_means, confidence, source_legal_url, source_rights_url, source_safety_url, updated_at"
          )
          .order("country", { ascending: true });

        if (!active) return;

        if (error) {
          const message = String(error?.message || "").toLowerCase();
          const missingTable =
            message.includes("does not exist") || message.includes("schema cache");

          if (missingTable) {
            setProfiles([]);
            setLoadError("");
            setIsLoading(false);
            return;
          }

          logDevError("Country rights profiles query error:", error);
          setLoadError("Could not load country rights profiles.");
          setProfiles([]);
          setIsLoading(false);
          return;
        }

        setProfiles(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (error) {
        if (!active) return;
        logDevError("Country rights profiles network error:", error);
        setLoadError("Could not load country rights profiles.");
        setProfiles([]);
        setIsLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [refreshTick]);

  const refresh = useCallback(() => {
    setRefreshTick((value) => value + 1);
  }, []);

  return { profiles, isLoading, loadError, refresh };
}
