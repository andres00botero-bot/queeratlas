export default function LegacyVibe({ value, displayedTags = [] }) {
  const text = typeof value === "string" ? value.trim() : "";
  const normalize = label => String(label).replaceAll("_", " ").trim().toLowerCase();
  if (!text || displayedTags.some(tag => normalize(tag) === normalize(text))) return null;

  return <p className="my-3 whitespace-pre-line break-words text-sm leading-6 text-white/85">{text}</p>;
}
