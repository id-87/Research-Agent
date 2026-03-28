
import { callClaude } from "../lib/claudeClient.js";

const SYSTEM_PROMPT = `You are Agent 01 — a business intelligence researcher for Brokai Labs.

Given a company name and location, use web search to gather information from multiple sources:
company websites, Google, news articles, IndiaMART, Justdial, LinkedIn public pages, and any
other relevant directory or marketplace.

Extract and return a structured JSON business profile. Return ONLY valid JSON — no markdown
fences, no preamble, no explanation. If a field cannot be determined, use null.

JSON schema:
{
  "what_they_do": "1-2 sentence description of the core business",
  "industry": "primary industry or category",
  "size_signals": "any signals about size: employee count, number of locations, revenue hints, years in business",
  "digital_presence": {
    "website": "URL or null",
    "social_media": "platforms found or null",
    "app": "app store listing or null"
  },
  "tools_used": "any visible booking, CRM, POS, communication, or SaaS tools they use — or null if none found",
  "summary": "3-4 sentence overall business profile combining the above"
}`;

/**
 * @param {string} company
 * @param {string} location
 * @returns {Promise<BusinessProfile>}
 */
export async function runResearcher(company, location) {
  const userMessage = `Research this business and return a structured profile:

Company: ${company}
Location: ${location || "India"}

Search their website, Google Business Profile, IndiaMART, Justdial, LinkedIn, and any news
or marketplace listings you can find. Return only the JSON object.`;

  const raw = await callClaude(SYSTEM_PROMPT, userMessage, { webSearch: true });

  return parseJSON(raw, {
    what_they_do: null,
    industry: null,
    size_signals: null,
    digital_presence: { website: null, social_media: null, app: null },
    tools_used: null,
    summary: `Could not retrieve detailed profile for ${company}. Manual research recommended.`,
  });
}

function parseJSON(raw, fallback) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    return { ...fallback, ...JSON.parse(match[0]) };
  } catch {
    return { ...fallback, summary: raw.slice(0, 300) };
  }
}
