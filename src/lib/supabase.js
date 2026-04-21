import { createClient } from "@supabase/supabase-js";

const RETRY_DELAY_MS = 140;

function isRetryableFetchError(error) {
  if (!error) return false;
  if (error.name === "AbortError") return false;
  if (error instanceof TypeError) return true;
  const message = String(error.message || "").toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const safeFetch = async (url, options = {}) => {
  const requestOptions = { ...options, cache: "no-store" };

  try {
    return await globalThis.fetch(url, requestOptions);
  } catch (firstError) {
    if (!isRetryableFetchError(firstError)) {
      throw firstError;
    }
    await wait(RETRY_DELAY_MS);
    return globalThis.fetch(url, requestOptions);
  }
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const missingEnv = [];
if (!supabaseUrl) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseKey) {
  missingEnv.push(
    "NEXT_PUBLIC_SUPABASE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  );
}

const missingEnvMessage =
  missingEnv.length > 0
    ? `[supabase] Missing required environment variable(s): ${missingEnv.join(
        ", "
      )}. Add them to .env.local and restart the app.`
    : "";

const createFailingClient = (message) =>
  new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    }
  );

if (missingEnvMessage && typeof console !== "undefined") {
  console.error(missingEnvMessage);
}

export const supabase =
  missingEnv.length > 0
    ? createFailingClient(missingEnvMessage)
    : createClient(supabaseUrl, supabaseKey, {
        global: {
          fetch: safeFetch,
        },
      });
