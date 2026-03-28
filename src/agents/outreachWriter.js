/**
 * Agent 03 — Outreach Writer
 *
 * Input:  { company: string, profile: BusinessProfile, contact: ContactCard }
 * Output: OutreachMessage string
 *
 * Generates a personalised WhatsApp-style cold outreach message as if sent
 * from Brokai Labs — an AI systems company that builds voice receptionists,
 * SaaS platforms, and automation tools for SMBs.
 */

import { callClaude } from "../lib/claudeClient.js";

const SYSTEM_PROMPT = `You are Agent 03 — an outreach copywriter for Brokai Labs.

Brokai Labs builds AI-powered systems for small and medium businesses:
- AI voice receptionists that answer calls 24/7
- Field operations SaaS for teams on the ground
- Communication automation (WhatsApp, SMS, follow-ups)

Write a WhatsApp-style cold outreach message to send to the target business. Rules:
- Under 120 words
- Outcome-first: lead with what they gain, not who you are
- Personalised: reference something specific about their business (what they do, their industry, a visible pain point)
- No formal salutations (no "Dear Sir/Madam")
- Conversational tone — written like a real person, not a marketing email
- End with a single soft call-to-action (e.g. "open to a quick chat?")
- Sign off as "Brokai Labs"

Return ONLY the message text. No labels, no subject line, no preamble.`;

/**
 * @param {string} company
 * @param {object} profile - output from Agent 01
 * @param {object} contact - output from Agent 02
 * @returns {Promise<string>}
 */
export async function runOutreachWriter(company, profile, contact) {
  const userMessage = `Write a personalised WhatsApp outreach message for this business:

Company: ${company}
Business Profile: ${JSON.stringify(profile, null, 2)}
Contact Info Available: ${contact.not_found ? "No contact found — write a general outreach message" : "Contact found — write as if sending directly"}

Focus on a specific pain point relevant to their industry. Reference their business concretely.
Return only the message text.`;

  const raw = await callClaude(SYSTEM_PROMPT, userMessage, { webSearch: false });
  return raw.trim();
}
