export default function MessageAvatar({
  name = "Member",
  src = "",
  active = false,
  size = "md",
  ringClassName = "border-white/14",
  statusBorderClassName = "border-[#0d131b]",
}) {
  const initials = String(name || "Member")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("") || "M";
  const sizeClassName = size === "lg" ? "h-11 w-11 text-sm" : "h-11 w-11 text-xs";

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-full border bg-white/[0.07] font-semibold text-white/82 ${sizeClassName} ${ringClassName}`} aria-hidden="true">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
      ) : initials}
      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${statusBorderClassName} ${active ? "bg-emerald-300 shadow-[0_0_9px_rgba(110,231,183,0.65)]" : "bg-slate-500"}`} />
    </span>
  );
}
