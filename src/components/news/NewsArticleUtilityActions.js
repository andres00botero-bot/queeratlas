"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export default function NewsArticleUtilityActions({ title, url, compact = false }) {
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setCopyStatus("Article link copied.");
      window.setTimeout(() => {
        setCopied(false);
        setCopyStatus("");
      }, 1800);
    } catch {
      setCopied(false);
      setCopyStatus("Article link could not be copied.");
    }
  };

  const share = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, url: url || window.location.href });
    } catch {
      // Closing the native share sheet is not an error the reader needs to see.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{copyStatus}</span>
      <button
        type="button"
        onClick={share}
        aria-label="Share article"
        title="Share article"
        className={compact ? "inline-flex size-10 items-center justify-center rounded-full text-white/52 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60" : "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-xs font-semibold text-white/76 transition hover:border-cyan-100/35 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"}
      >
        <Share2 size={14} aria-hidden="true" />
        {compact ? null : "Share"}
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy article link"}
        title={copied ? "Link copied" : "Copy article link"}
        className={compact ? "inline-flex size-10 items-center justify-center rounded-full text-white/52 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60" : "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-xs font-semibold text-white/76 transition hover:border-cyan-100/35 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60"}
      >
        {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
        {compact ? null : copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
