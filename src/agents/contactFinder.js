/**
 * Agent 02 — Contact Finder
 *
 * Input:  { company: string, location: string, profile: BusinessProfile }
 * Output: ContactCard object
 *
 * Uses the business profile from Agent 01 to locate contact details.
 * Checks company website, Google Business Profile, IndiaMART, Justdial, Yelp,
 * and other relevant directories. Prioritises phone, email, WhatsApp.
 */

import { callClaude } from "../lib/claudeClient.js";

const SYSTEM_PROMPT = `You are Agent 02 — a contact information specialist for Brokai Labs.

Given a business profile, search for contact details across:
- The company's own website (look for /contact, footer, about pages)
- Google Business Profile
- IndiaMART (for Indian businesses)
- Justdial
- Yelp
- Any other relevant local directory

Prioritise finding: phone number, email address, WhatsApp number (if publicly listed).
Always record the source URL where you found the contact info.

Return ONLY valid JSON — no markdown fences, no preamble. If a field is not found, use null.
Never invent or guess contact details.

JSON schema:
{
  "phone": "phone number with country code or null",
  "email": "email address or null",
  "whatsapp": "WhatsApp number if explicitly listed or null",
  "website": "company website URL or null",
  "source_url": "the specific URL where contact info was found, or null",
  "source_name": "name of the directory/platform (e.g. Justdial, company website) or null",
  "confidence": "high | medium | low — how confident you are this is correct contact info"
}`;

/**
 * @param {string} company
 * @param {string} location
 * @param {object} profile - output from Agent 01
 * @returns {Promise<ContactCard>}
 */
export async function runContactFinder(company, location, profile) {
  const userMessage = `Find contact information for this business:

Company: ${company}
Location: ${location || "India"}
Business Profile: ${JSON.stringify(profile, null, 2)}

Search their website, Google Business Profile, IndiaMART, Justdial, and any other
directories you find. Return only the JSON object with contact details and source URL.`;

  const raw = await callClaude(SYSTEM_PROMPT, userMessage, { webSearch: true });

  return parseJSON(raw, {
    phone: null,
    email: null,
    whatsapp: null,
    website: profile?.digital_presence?.website || null,
    source_url: null,
    source_name: null,
    confidence: "low",
    not_found: true,
  });
}

function parseJSON(raw, fallback) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { ...fallback };
    const parsed = JSON.parse(match[0]);
    const hasContact = parsed.phone || parsed.email || parsed.whatsapp;
    return { ...fallback, ...parsed, not_found: !hasContact };
  } catch {
    return { ...fallback };
  }
}
