"use client";

export default function EmptyState({ title, description, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-white/12 bg-black/20 px-5 py-10 text-center ${className}`}
    >
      <p className="text-sm text-white/55">{title}</p>
      {description && <p className="mt-2 text-xs text-white/42">{description}</p>}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
