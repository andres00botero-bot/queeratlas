"use client";

import { useState } from "react";

const SIGNAL_LABELS = {
  legal: "Legal",
  rights: "Rights",
  safety: "Safety",
};

const LEVEL_ACCENTS = {
  good: {
    dot: "bg-emerald-300",
    ring: "shadow-[0_0_0_2px_rgba(16,185,129,0.22)]",
  },
  mixed: {
    dot: "bg-amber-300",
    ring: "shadow-[0_0_0_2px_rgba(251,191,36,0.2)]",
  },
  risk: {
    dot: "bg-rose-300",
    ring: "shadow-[0_0_0_2px_rgba(251,113,133,0.2)]",
  },
  unknown: {
    dot: "bg-white/45",
    ring: "shadow-[0_0_0_2px_rgba(255,255,255,0.16)]",
  },
};

const LEVEL_CONTEXT_LABEL = {
  good: "Safer",
  mixed: "Watch",
  risk: "Caution",
  unknown: "Unknown",
};

function resolveLegalSignalFromDetails(signal, details = {}) {
  const sameSex = String(details?.sameSexRelations || "").toLowerCase();

  if (sameSex.includes("criminalized")) {
    return {
      ...signal,
      level: "risk",
      label: "Criminalized",
      className: "border-rose-200/30 bg-rose-300/14 text-rose-100/95",
    };
  }

  if (sameSex.includes("restricted")) {
    return {
      ...signal,
      level: "risk",
      label: "Restricted",
      className: "border-rose-200/30 bg-rose-300/14 text-rose-100/95",
    };
  }

  if (sameSex.includes("unknown")) {
    return {
      ...signal,
      level: "unknown",
      label: "Unknown",
      className: "border-white/18 bg-white/10 text-white/78",
    };
  }

  if (sameSex.includes("legal")) {
    return {
      ...signal,
      level: signal.level || "good",
      label: signal.label || "Strong",
    };
  }

  return signal;
}

function SignalPill({ signal }) {
  const accent = LEVEL_ACCENTS[signal.level] || LEVEL_ACCENTS.unknown;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] ${signal.className} ${accent.ring}`}
      title={`${SIGNAL_LABELS[signal.id]}: ${signal.label}`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${accent.dot}`} />
      <span className="font-semibold">{SIGNAL_LABELS[signal.id]}</span>
      <span className="mx-1 text-white/32">/</span>
      <span>{signal.label}</span>
    </span>
  );
}

export default function CityRightsSignals({ snapshot }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!snapshot) return null;

  const legalSignal = resolveLegalSignalFromDetails(snapshot.legal, snapshot.details);
  const signals = [legalSignal, snapshot.rights, snapshot.safety].filter(Boolean);
  if (signals.length === 0) return null;

  const activeLevels = Array.from(new Set(signals.map((signal) => String(signal.level || "unknown"))));

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {signals.map((signal) => (
          <SignalPill key={signal.id} signal={signal} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-white/64">
        <span className="text-white/46">Current profile:</span>
        {activeLevels.map((level) => {
          const accent = LEVEL_ACCENTS[level] || LEVEL_ACCENTS.unknown;
          return (
            <span
              key={`context-${level}`}
              className="inline-flex items-center gap-1 rounded-full border border-white/14 bg-white/6 px-2 py-0.5"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
              {LEVEL_CONTEXT_LABEL[level] || "Unknown"}
            </span>
          );
        })}
      </div>

      <p className="break-words text-sm leading-7 text-white/72">
        {snapshot.whatThisMeans}
      </p>

      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        className="inline-flex w-full items-center justify-between rounded-xl border border-cyan-200/46 bg-cyan-300/18 px-4 py-3 text-left text-[14px] font-semibold tracking-[0.02em] text-cyan-50 transition hover:border-cyan-200/62 hover:bg-cyan-300/24"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="text-sm leading-none">{isExpanded ? "v" : ">"}</span>
          {isExpanded ? "Hide legal breakdown" : "Open legal breakdown"}
        </span>
        <span className="text-[12px] text-cyan-100/95">{isExpanded ? "Collapse" : "Expand"}</span>
      </button>

      {isExpanded && (
        <div className="space-y-3 rounded-xl border border-white/16 bg-white/[0.05] p-4 text-sm leading-7 text-white/90 sm:text-[15px]">
          <p className="text-[12px] uppercase tracking-[0.13em] text-white/68">Legal status breakdown</p>
          <p>
            <span className="font-medium text-white">Same-sex relations:</span>{" "}
            {snapshot.details?.sameSexRelations || "Unknown"}
          </p>
          <p>
            <span className="font-medium text-white">Marriage / partnership:</span>{" "}
            {snapshot.details?.unions || "Unknown"}
          </p>
          <p>
            <span className="font-medium text-white">Legal gender recognition:</span>{" "}
            {snapshot.details?.genderRecognition || "Unknown"}
          </p>
          <p>
            <span className="font-medium text-white">Anti-discrimination laws:</span>{" "}
            {snapshot.details?.antiDiscrimination || "Unknown"}
          </p>
          <div className="pt-1 text-[12px] text-white/78">
            <span className="text-white/86">Sources: </span>
            {snapshot.sources?.legal ? (
              <a
                href={snapshot.sources.legal}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/45 underline-offset-2 hover:text-white"
              >
                legal
              </a>
            ) : (
              <span>legal</span>
            )}
            <span> / </span>
            {snapshot.sources?.rights ? (
              <a
                href={snapshot.sources.rights}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/45 underline-offset-2 hover:text-white"
              >
                rights
              </a>
            ) : (
              <span>rights</span>
            )}
            <span> / </span>
            {snapshot.sources?.safety ? (
              <a
                href={snapshot.sources.safety}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/45 underline-offset-2 hover:text-white"
              >
                safety
              </a>
            ) : (
              <span>safety</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
