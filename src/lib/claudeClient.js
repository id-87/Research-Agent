/**
 * Shared Claude API client
 *
 * Wraps the Anthropic /v1/messages endpoint.
 * All three agents use this — keeping API config in one place.
 */

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

/**
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {object} options
 * @param {boolean} options.webSearch - enable web search tool
 * @returns {Promise<string>} - text content from the response
 */
export async function callClaude(systemPrompt, userMessage, options = {}) {
  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  };

  if (options.webSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const headers = {
    "Content-Type": "application/json",
  };

  // In production (deployed app), the API key comes from the environment.
  // In the Claude.ai artifact environment, auth is handled automatically.
  const apiKey = typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_ANTHROPIC_API_KEY
    : process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();

  // Extract all text blocks from the response (web search may add tool_use blocks)
  const textBlocks = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text);

  return textBlocks.join("\n").trim();
}
