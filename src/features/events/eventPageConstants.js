export const REPORT_REASONS = [
  { value: "safety", label: "Safety issue", helper: "Unsafe behavior, consent issues, harassment, or risky conditions." },
  { value: "wrong_info", label: "Wrong info", helper: "Date, location, link, or event details are incorrect." },
  { value: "spam", label: "Spam or scam", helper: "Misleading promos, fake listings, or low-trust content." },
  { value: "abuse", label: "Abuse or hate", helper: "Hate speech, threats, discrimination, or abusive language." },
  { value: "other", label: "Other issue", helper: "Anything else that should be reviewed by admin." },
];

export const TRUST_ACTIONS = [
  { value: "1", label: "Verified now" },
  { value: "3", label: "Closed or moved" },
];
