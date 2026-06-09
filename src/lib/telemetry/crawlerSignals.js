const BOT_PATTERNS = [
  { key: "googlebot", label: "Googlebot", pattern: /googlebot/i },
  { key: "google-extended", label: "Google-Extended", pattern: /google-extended/i },
  { key: "oai-searchbot", label: "OAI-SearchBot", pattern: /oai-searchbot/i },
  { key: "gptbot", label: "GPTBot", pattern: /gptbot/i },
  { key: "chatgpt-user", label: "ChatGPT-User", pattern: /chatgpt-user/i },
  { key: "claude-searchbot", label: "Claude-SearchBot", pattern: /claude-searchbot/i },
  { key: "claudebot", label: "ClaudeBot", pattern: /claudebot/i },
  { key: "claude-user", label: "Claude-User", pattern: /claude-user/i },
  { key: "perplexitybot", label: "PerplexityBot", pattern: /perplexitybot/i },
  { key: "bingbot", label: "Bingbot", pattern: /bingbot/i },
  { key: "duckassistbot", label: "DuckAssistBot", pattern: /duckassistbot/i },
];

export function classifyCrawlerUserAgent(userAgent = "") {
  const normalized = String(userAgent || "");
  for (const entry of BOT_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      return entry;
    }
  }
  return null;
}

export function isCrawlerUserAgent(userAgent = "") {
  return Boolean(classifyCrawlerUserAgent(userAgent));
}
