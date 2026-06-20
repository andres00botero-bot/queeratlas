"use client";

const SIGNAL_LABELS = {
  legal: "Legal",
  rights: "Rights",
  safety: "Safety",
};

const LEVEL_THEME = {
  good: {
    label: "Safer",
    eyebrow: "Strong baseline",
    mapColor: "#22c55e",
    rgb: "34,197,94",
    dot: "bg-emerald-300",
    text: "text-emerald-100",
    softText: "text-emerald-100/78",
    border: "border-emerald-200/24",
    chip: "border-emerald-200/28 bg-emerald-300/13 text-emerald-50",
    glow: "from-emerald-300/24 via-cyan-300/10 to-transparent",
    progress: "bg-emerald-300",
    track: "bg-emerald-50/10",
    summary: "A stronger legal and social baseline, with normal local awareness still useful.",
  },
  mixed: {
    label: "Watch",
    eyebrow: "Context matters",
    mapColor: "#facc15",
    rgb: "250,204,21",
    dot: "bg-amber-300",
    text: "text-amber-100",
    softText: "text-amber-100/78",
    border: "border-amber-200/26",
    chip: "border-amber-200/30 bg-amber-300/14 text-amber-50",
    glow: "from-amber-300/24 via-fuchsia-300/8 to-transparent",
    progress: "bg-amber-300",
    track: "bg-amber-50/10",
    summary: "Generally workable, but rights, social comfort, or night safety can shift by context.",
  },
  risk: {
    label: "Caution",
    eyebrow: "Plan carefully",
    mapColor: "#f472b6",
    rgb: "244,114,182",
    dot: "bg-rose-300",
    text: "text-rose-100",
    softText: "text-rose-100/78",
    border: "border-rose-200/28",
    chip: "border-rose-200/30 bg-rose-300/14 text-rose-50",
    glow: "from-rose-300/24 via-orange-300/8 to-transparent",
    progress: "bg-rose-300",
    track: "bg-rose-50/10",
    summary: "Extra discretion and route planning matter because legal or public-safety context is limited.",
  },
  unknown: {
    label: "Unknown",
    eyebrow: "Being verified",
    mapColor: "#ffffff",
    rgb: "255,255,255",
    dot: "bg-white/50",
    text: "text-white/84",
    softText: "text-white/62",
    border: "border-white/18",
    chip: "border-white/16 bg-white/8 text-white/78",
    glow: "from-white/14 via-cyan-300/5 to-transparent",
    progress: "bg-white/50",
    track: "bg-white/10",
    summary: "Rights context is still being verified, so use local sources before planning.",
  },
};

const DETAIL_ROWS = [
  { key: "sameSexRelations", label: "Same-sex relations" },
  { key: "unions", label: "Marriage / partnership" },
  { key: "genderRecognition", label: "Legal gender recognition" },
  { key: "antiDiscrimination", label: "Anti-discrimination laws" },
];

const LEFT_ALIGNED_TEXT = {
  textAlign: "left",
  textJustify: "auto",
};

const JUSTIFIED_TEXT = {
  textAlign: "justify",
  textJustify: "inter-word",
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

function resolveOverallLevel(signals = []) {
  const severity = {
    unknown: 0,
    good: 1,
    mixed: 2,
    risk: 3,
  };

  return signals.reduce((current, signal) => {
    const level = String(signal?.level || "unknown");
    if ((severity[level] || 0) > (severity[current] || 0)) return level;
    return current;
  }, "unknown");
}

function getSignalStrength(level = "unknown") {
  if (level === "good") return "w-[86%]";
  if (level === "mixed") return "w-[58%]";
  if (level === "risk") return "w-[32%]";
  return "w-[44%]";
}

function getDetailTone(value = "") {
  const normalized = String(value || "").toLowerCase();

  if (
    normalized.includes("criminal") ||
    normalized.includes("not legal") ||
    normalized.includes("not available") ||
    normalized.includes("no legal") ||
    normalized.includes("limited / none") ||
    normalized.includes("no broad")
  ) {
    return "risk";
  }

  if (
    normalized.includes("restricted") ||
    normalized.includes("limited") ||
    normalized.includes("partial") ||
    normalized.includes("civil union")
  ) {
    return "mixed";
  }

  if (
    normalized.includes("legal") ||
    normalized.includes("available") ||
    normalized.includes("marriage") ||
    normalized.includes("full coverage")
  ) {
    return "good";
  }

  return "unknown";
}

function StatusChip({ value }) {
  const tone = getDetailTone(value);
  const theme = LEVEL_THEME[tone] || LEVEL_THEME.unknown;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${theme.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
      {value || "Unknown"}
    </span>
  );
}

function SignalMeter({ signal }) {
  const theme = LEVEL_THEME[signal.level] || LEVEL_THEME.unknown;

  return (
    <div className={`rounded-2xl border ${theme.border} bg-white/[0.045] p-3`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">{SIGNAL_LABELS[signal.id]}</p>
          <p className={`mt-1 text-sm font-semibold ${theme.text}`}>{signal.label}</p>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${theme.dot} shadow-[0_0_18px_currentColor]`} />
      </div>
      <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${theme.track}`}>
        <div className={`h-full rounded-full ${theme.progress} ${getSignalStrength(signal.level)}`} />
      </div>
    </div>
  );
}

function SourceLink({ href, label }) {
  if (!href) return <span className="text-white/38">{label}</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white/60"
    >
      {label}
    </a>
  );
}

export default function CityRightsSignals({ snapshot, country = "" }) {
  if (!snapshot) return null;

  const legalSignal = resolveLegalSignalFromDetails(snapshot.legal, snapshot.details);
  const signals = [legalSignal, snapshot.rights, snapshot.safety].filter(Boolean);
  if (signals.length === 0) return null;

  const overallLevel = resolveOverallLevel(signals);
  const overallTheme = LEVEL_THEME[overallLevel] || LEVEL_THEME.unknown;
  const confidence = String(snapshot.confidence || "medium").trim();
  const updatedAt = snapshot.updatedAt ? new Date(snapshot.updatedAt).getFullYear() : null;
  const overallColor = overallTheme.mapColor || "#ffffff";
  const overallRgb = overallTheme.rgb || "255,255,255";

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-4 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-5"
      style={{ borderColor: `rgba(${overallRgb},0.24)`, ...LEFT_ALIGNED_TEXT }}
    >
      <div className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${overallTheme.glow} blur-3xl`} />
      <div className="relative grid gap-4 xl:grid-cols-[0.95fr_1.25fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className="relative grid h-20 w-full shrink-0 place-items-center overflow-hidden rounded-[24px] border bg-black/34 sm:h-24 sm:w-24 sm:rounded-[28px]"
              style={{
                borderColor: overallColor,
                background:
                  `radial-gradient(circle at 35% 20%, rgba(${overallRgb},0.30), transparent 42%), ` +
                  `linear-gradient(145deg, rgba(${overallRgb},0.18), rgba(0,0,0,0.42) 58%, rgba(${overallRgb},0.08))`,
                boxShadow:
                  `0 0 0 1px rgba(${overallRgb},0.20), ` +
                  `0 18px 42px rgba(${overallRgb},0.18), ` +
                  "inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              <div className="pointer-events-none absolute -right-5 -top-5 h-14 w-14 rounded-full bg-white/14 blur-xl" />
              <div className="text-center">
                <p className="text-2xl font-black tracking-[-0.05em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.38)]">
                  {overallTheme.label}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className={`text-[11px] uppercase tracking-[0.22em] ${overallTheme.softText}`}>{overallTheme.eyebrow}</p>
              <h3 className="mt-1 text-[1.75rem] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-2xl">Queer safety</h3>
              <p className="mt-2 max-w-[34rem] text-left text-sm leading-6 text-white/62" style={LEFT_ALIGNED_TEXT}>
                Legal rights and practical context{country ? ` for ${country}` : ""}.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/18 p-3.5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">What this means</p>
            <p className="mt-2 break-words text-sm leading-7 text-white/76" style={JUSTIFIED_TEXT}>{snapshot.whatThisMeans}</p>
            <p className="mt-3 text-xs leading-5 text-white/45" style={LEFT_ALIGNED_TEXT}>{overallTheme.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-white/52">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              Confidence: <span className="text-white/76">{confidence || "medium"}</span>
            </span>
            {updatedAt ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                Updated: <span className="text-white/76">{updatedAt}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-3">
            {signals.map((signal) => (
              <SignalMeter key={signal.id} signal={signal} />
            ))}
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/12 bg-black/20">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">Legal breakdown</p>
                <p className="mt-0.5 text-sm text-white/72">Visible at a glance, no extra tap needed.</p>
              </div>
              <span className={`hidden rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] sm:inline-flex ${overallTheme.chip}`}>
                {overallTheme.label}
              </span>
            </div>

            <div className="divide-y divide-white/8">
              {DETAIL_ROWS.map((row) => {
                const value = snapshot.details?.[row.key] || "Unknown";

                return (
                  <div key={row.key} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <p className="text-sm font-medium text-white/84">{row.label}</p>
                    <div className="sm:justify-self-end">
                      <StatusChip value={value} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[12px] text-white/48">
            <span className="text-white/62">Sources: </span>
            <SourceLink href={snapshot.sources?.legal} label="legal" />
            <span> / </span>
            <SourceLink href={snapshot.sources?.rights} label="rights" />
            <span> / </span>
            <SourceLink href={snapshot.sources?.safety} label="safety" />
          </div>
        </div>
      </div>
    </div>
  );
}
