import { createClient } from "@supabase/supabase-js";

const safeFetch = async (url, options = {}) => {
  try {
    return await globalThis.fetch(url, { ...options, cache: "no-store" });
  } catch {
    return globalThis.fetch(url, options);
  }
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY,
  {
    global: {
      fetch: safeFetch,
    },
  }
);
