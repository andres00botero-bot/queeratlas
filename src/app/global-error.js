"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-rose-200/75">Unexpected Error</p>
          <h1 className="mt-3 text-3xl font-semibold">Something broke in the atlas.</h1>
          <p className="mt-3 text-sm text-white/70">
            We logged this issue automatically. Try reloading this view.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm transition hover:border-white/35 hover:bg-white/14"
          >
            Reload page
          </button>
        </main>
      </body>
    </html>
  );
}
