/**
 * Pipeline Orchestrator
 *
 * Chains Agent 01 → Agent 02 → Agent 03 for a single company.
 * Handles per-agent errors gracefully — a failure in one agent
 * produces a fallback output rather than crashing the pipeline.
 *
 * Each company row always produces a complete output object,
 * even if some fields are null or contain error messages.
 */

import { runResearcher } from "./agents/researcher.js";
import { runContactFinder } from "./agents/contactFinder.js";
import { runOutreachWriter } from "./agents/outreachWriter.js";

/**
 * @typedef {Object} PipelineResult
 * @property {string} company
 * @property {string} location
 * @property {object} profile       - from Agent 01
 * @property {object} contact       - from Agent 02
 * @property {string} outreach      - from Agent 03
 * @property {object} errors        - per-agent error messages if any
 * @property {'complete'|'partial'|'failed'} status
 */

/**
 * Run the full 3-agent pipeline for one company.
 *
 * @param {string} company
 * @param {string} location
 * @param {function} onStageChange - callback(stage: string) for UI progress updates
 * @returns {Promise<PipelineResult>}
 */
export async function runPipeline(company, location, onStageChange = () => {}) {
  const result = {
    company,
    location,
    profile: null,
    contact: null,
    outreach: null,
    errors: {},
    status: "complete",
  };

  // ── Agent 01: Researcher ─────────────────────────────────────────────────
  onStageChange("researching");
  try {
    result.profile = await runResearcher(company, location);
  } catch (err) {
    result.errors.researcher = err.message;
    result.profile = {
      what_they_do: null,
      industry: null,
      size_signals: null,
      digital_presence: { website: null, social_media: null, app: null },
      tools_used: null,
      summary: `Research failed: ${err.message}`,
    };
    result.status = "partial";
  }

  // ── Agent 02: Contact Finder ─────────────────────────────────────────────
  onStageChange("finding_contacts");
  try {
    result.contact = await runContactFinder(company, location, result.profile);
  } catch (err) {
    result.errors.contactFinder = err.message;
    result.contact = {
      phone: null,
      email: null,
      whatsapp: null,
      website: null,
      source_url: null,
      source_name: null,
      confidence: "low",
      not_found: true,
    };
    result.status = "partial";
  }

  // ── Agent 03: Outreach Writer ────────────────────────────────────────────
  onStageChange("writing_outreach");
  try {
    result.outreach = await runOutreachWriter(company, result.profile, result.contact);
  } catch (err) {
    result.errors.outreachWriter = err.message;
    result.outreach = `Hi, we're Brokai Labs — we help businesses like ${company} automate their front-desk and communication workflows with AI. Would you be open to a quick call?`;
    result.status = "partial";
  }

  onStageChange("done");
  return result;
}
