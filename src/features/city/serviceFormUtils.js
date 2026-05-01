export function normalizeServicePriceTierOptions(input) {
  const normalized = (Array.isArray(input) ? input : [])
    .map((item, index) => {
      if (item && typeof item === "object") {
        const value = String(item.value ?? "");
        const label = String(item.label ?? (value || "Price tier (optional)"));
        return { key: `${value || "empty"}-${index}`, value, label };
      }

      const value = String(item ?? "");
      return {
        key: `${value || "empty"}-${index}`,
        value,
        label: value || "Price tier (optional)",
      };
    })
    .filter((option, index, all) => all.findIndex((candidate) => candidate.value === option.value) === index);

  return normalized.length > 0
    ? normalized
    : [{ key: "empty-0", value: "", label: "Price tier (optional)" }];
}
