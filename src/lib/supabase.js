import { createClient } from "@supabase/supabase-js";

const RETRY_DELAY_MS = 140;
const REQUEST_TIMEOUT_MS = 12_000;
const SUPABASE_UNAVAILABLE_MESSAGE =
  "Supabase is temporarily unreachable. Please try again shortly or use another network or VPN.";

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

function createUnavailableError() {
  const error = new Error(SUPABASE_UNAVAILABLE_MESSAGE);
  error.name = "SupabaseUnavailableError";
  return error;
}

function isGatewayUnavailable(response) {
  return [502, 503, 504, 522, 523, 524].includes(Number(response?.status));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  const abortFromExternalSignal = () => controller.abort(externalSignal?.reason);
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (externalSignal?.aborted) {
    abortFromExternalSignal();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternalSignal, { once: true });
  }

  try {
    const response = await globalThis.fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (isGatewayUnavailable(response)) {
      throw createUnavailableError();
    }
    return response;
  } catch (error) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw createUnavailableError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }
}

const safeFetch = async (url, options = {}) => {
  const requestOptions = { ...options, cache: "no-store" };

  try {
    return await fetchWithTimeout(url, requestOptions);
  } catch (firstError) {
    if (!isRetryableFetchError(firstError)) {
      throw firstError;
    }
    await wait(RETRY_DELAY_MS);
    try {
      return await fetchWithTimeout(url, requestOptions);
    } catch (retryError) {
      if (isRetryableFetchError(retryError)) {
        throw createUnavailableError();
      }
      throw retryError;
    }
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
