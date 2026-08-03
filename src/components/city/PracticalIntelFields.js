"use client";

export default function PracticalIntelFields({ title, description, fields = [], tone = "emerald" }) {
  const toneClasses = tone === "violet"
    ? "border-violet-200/18 bg-violet-200/[0.05] text-violet-100"
    : tone === "cyan"
      ? "border-cyan-200/18 bg-cyan-200/[0.05] text-cyan-100"
      : "border-emerald-200/18 bg-emerald-200/[0.05] text-emerald-100";

  return (
    <section className={`rounded-2xl border p-4 ${toneClasses}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-white/60">{description}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-white/55">{field.label}</span>
            <textarea
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              maxLength={320}
              rows={2}
              placeholder={field.placeholder}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-white/45">Community ratings are calculated from member feedback and cannot be entered here.</p>
    </section>
  );
}
