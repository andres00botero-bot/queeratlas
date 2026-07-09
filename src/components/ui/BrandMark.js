import Image from "next/image";

const TONE_STYLES = {
  cyan: "border-cyan-100/28 bg-cyan-100/10 text-cyan-50 shadow-[0_18px_46px_rgba(34,211,238,0.12)]",
  fuchsia: "border-fuchsia-100/28 bg-fuchsia-100/10 text-fuchsia-50 shadow-[0_18px_46px_rgba(217,70,239,0.12)]",
  amber: "border-amber-100/28 bg-amber-100/10 text-amber-50 shadow-[0_18px_46px_rgba(251,191,36,0.1)]",
  white: "border-white/24 bg-white/10 text-white shadow-[0_18px_46px_rgba(255,255,255,0.07)]",
};

export default function BrandMark({
  label = "Queer Atlas",
  sublabel = "Guide",
  className = "",
  tone = "cyan",
  compact = false,
  iconOnly = false,
}) {
  const toneClass = TONE_STYLES[tone] || TONE_STYLES.cyan;
  const logoSizeClass = compact ? "h-8 w-8" : "h-10 w-10";
  const imageSizeClass = compact ? "h-5 w-5" : "h-7 w-7";

  if (iconOnly) {
    return (
      <Image
        src="/queer-atlas-logo.png"
        alt="Queer Atlas logo"
        width={64}
        height={64}
        className={`inline-block shrink-0 object-contain ${logoSizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border px-3 py-2 ring-1 ring-white/10 backdrop-blur-md ${toneClass} ${className}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full border border-white/24 bg-white/14 shadow-[0_8px_22px_rgba(0,0,0,0.22)] ${logoSizeClass}`}
      >
        <Image
          src="/queer-atlas-logo.png"
          alt="Queer Atlas logo"
          width={48}
          height={48}
          className={`${imageSizeClass} shrink-0`}
        />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block text-xs font-semibold uppercase text-white">{label}</span>
        <span className="mt-1 block text-[10px] uppercase text-white/62">{sublabel}</span>
      </span>
    </div>
  );
}
