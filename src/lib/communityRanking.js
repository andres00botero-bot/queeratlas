export function getMemberTitleMeta(title = "") {
  const normalized = String(title || "").trim().toLowerCase();

  if (normalized === "global explorer") {
    return {
      label: "Global Explorer",
      icon: "✦",
      iconClass: "text-fuchsia-300",
      className:
        "border-fuchsia-300/30 bg-fuchsia-300/12 text-fuchsia-100",
    };
  }

  if (normalized === "city architect") {
    return {
      label: "City Architect",
      icon: "◆",
      iconClass: "text-sky-300",
      className: "border-sky-300/28 bg-sky-300/12 text-sky-100",
    };
  }

  if (normalized === "local legend") {
    return {
      label: "Local Legend",
      icon: "★",
      iconClass: "text-amber-300",
      className:
        "border-amber-300/35 bg-amber-300/14 text-amber-100",
    };
  }

  if (normalized === "review oracle") {
    return {
      label: "Review Oracle",
      icon: "◉",
      iconClass: "text-emerald-300",
      className:
        "border-emerald-300/30 bg-emerald-300/12 text-emerald-100",
    };
  }

  if (normalized === "venue scout") {
    return {
      label: "Venue Scout",
      icon: "⌖",
      iconClass: "text-violet-300",
      className:
        "border-violet-300/30 bg-violet-300/12 text-violet-100",
    };
  }

  if (normalized === "rising contributor") {
    return {
      label: "Rising Contributor",
      icon: "•",
      iconClass: "text-white/70",
      className: "border-white/20 bg-white/10 text-white/80",
    };
  }

  return {
    label: "",
    icon: "",
    iconClass: "text-white/65",
    className: "border-white/20 bg-white/8 text-white/75",
  };
}
