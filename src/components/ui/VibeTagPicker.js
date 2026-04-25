import { STANDARD_VIBE_TAGS, normalizeVibeTags } from "@/lib/vibeTaxonomy";

const TONE_STYLES = {
  emerald: {
    panel: "border-emerald-200/18 bg-emerald-200/8",
    idle: "border-white/12 bg-black/35 text-white/72 hover:border-emerald-200/32 hover:text-white",
    active: "border-emerald-200/44 bg-emerald-200/18 text-emerald-50",
    helper: "text-emerald-100/80",
  },
  cyan: {
    panel: "border-cyan-200/18 bg-cyan-200/8",
    idle: "border-white/12 bg-black/35 text-white/72 hover:border-cyan-200/32 hover:text-white",
    active: "border-cyan-200/44 bg-cyan-200/18 text-cyan-50",
    helper: "text-cyan-100/80",
  },
  amber: {
    panel: "border-amber-200/18 bg-amber-200/8",
    idle: "border-white/12 bg-black/35 text-white/72 hover:border-amber-200/32 hover:text-white",
    active: "border-amber-200/44 bg-amber-200/18 text-amber-50",
    helper: "text-amber-100/80",
  },
  violet: {
    panel: "border-violet-200/18 bg-violet-200/8",
    idle: "border-white/12 bg-black/35 text-white/72 hover:border-violet-200/32 hover:text-white",
    active: "border-violet-200/44 bg-violet-200/18 text-violet-50",
    helper: "text-violet-100/80",
  },
};

function resolveToneStyles(tone) {
  return TONE_STYLES[tone] || TONE_STYLES.cyan;
}

function buildNextTags(currentTags, nextTag, max) {
  const current = normalizeVibeTags(currentTags, { max });
  if (current.includes(nextTag)) {
    return current.filter((item) => item !== nextTag);
  }
  if (current.length >= max) {
    return current;
  }
  return [...current, nextTag];
}

export default function VibeTagPicker({
  value = [],
  onChange,
  title = "Standard vibes",
  hint = "Choose up to 3 tags.",
  max = 3,
  tone = "cyan",
  className = "",
}) {
  const selectedTags = normalizeVibeTags(value, { max });
  const selectedSet = new Set(selectedTags);
  const styles = resolveToneStyles(tone);

  return (
    <div className={`rounded-2xl border p-3 ${styles.panel} ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">{title}</p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">
          {selectedTags.length}/{max}
        </p>
      </div>
      <p className={`mt-1 text-[11px] ${styles.helper}`}>{hint}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {STANDARD_VIBE_TAGS.map((item) => {
          const selected = selectedSet.has(item.key);
          return (
            <button
              key={`vibe-tag-${item.key}`}
              type="button"
              onClick={() => {
                if (typeof onChange !== "function") return;
                onChange(buildNextTags(selectedTags, item.key, max));
              }}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                selected ? styles.active : styles.idle
              }`}
              aria-pressed={selected}
            >
              <span className="font-medium">{item.label}</span>
              <span className="mt-0.5 block text-[10px] opacity-80">{item.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
