import { useState, useCallback } from "react";
import { FileUpload } from "./components/FileUpload.jsx";
import { ResultRow } from "./components/ResultRow.jsx";
import { runPipeline } from "./pipeline.js";

const CONCURRENCY = 2; // process N companies at a time

export default function App() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  const updateRow = useCallback((index, patch) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }, []);

  const handleLoad = (companies) => {
    setRows(companies.map((c) => ({ ...c, status: "pending", profile: null, contact: null, outreach: null, errors: {} })));
  };

  const runAll = async () => {
    if (!rows.length || running) return;
    setRunning(true);

    // Reset all rows to pending
    setRows((prev) => prev.map((r) => ({ ...r, status: "pending", profile: null, contact: null, outreach: null, errors: {} })));

    // Process in batches of CONCURRENCY
    const indices = rows.map((_, i) => i);
    for (let i = 0; i < indices.length; i += CONCURRENCY) {
      const batch = indices.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (idx) => {
          const { company, location } = rows[idx];
          try {
            const result = await runPipeline(company, location, (stage) => {
              updateRow(idx, { status: stage });
            });
            updateRow(idx, { ...result, status: result.status });
          } catch (err) {
            updateRow(idx, {
              status: "error",
              errors: { pipeline: err.message },
              profile: { summary: "Pipeline failed. Please retry." },
              contact: { not_found: true },
              outreach: `Hi, we're Brokai Labs — we build AI tools for SMBs like ${rows[idx].company}. Open to a quick chat?`,
            });
          }
        })
      );
    }

    setRunning(false);
  };

  const doneCount = rows.filter((r) => ["done", "partial"].includes(r.status)).length;
  const progress = rows.length ? Math.round((doneCount / rows.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: "#111",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#fff", fontSize: 16, letterSpacing: -0.5
            }}>B</div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>
              Brokai Labs — Lead Intelligence Pipeline
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#999" }}>
            Agent 01: Researcher → Agent 02: Contact Finder → Agent 03: Outreach Writer
          </p>
        </div>

        {/* ── Step 1: Upload ── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8e8e8", padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>
            Step 1 — Load companies
          </div>
          <FileUpload onLoad={handleLoad} disabled={running} />
        </div>

        {/* ── Step 2: Run ── */}
        {rows.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8e8e8", padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
                  Step 2 — Run pipeline
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {rows.length} {rows.length === 1 ? "company" : "companies"} loaded
                  {running && ` · ${doneCount}/${rows.length} processed`}
                  {!running && doneCount > 0 && ` · ${doneCount} completed`}
                </div>
              </div>
              <button
                onClick={runAll}
                disabled={running}
                style={{
                  padding: "10px 24px", borderRadius: 8,
                  background: running ? "#ccc" : "#111",
                  color: "#fff", border: "none",
                  cursor: running ? "not-allowed" : "pointer",
                  fontWeight: 500, fontSize: 14,
                  transition: "background 0.15s",
                }}
              >
                {running ? "Running…" : doneCount > 0 ? "Re-run All" : "Run Pipeline"}
              </button>
            </div>

            {running && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 5 }}>
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 4, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: "#111", borderRadius: 4,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Results table ── */}
        {rows.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "36px 1fr 200px 64px",
              gap: 12, padding: "10px 20px",
              borderBottom: "0.5px solid #ececec",
              background: "#fafafa",
            }}>
              {["#", "Company", "Status", ""].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
              ))}
            </div>

            {rows.map((row, i) => (
              <ResultRow key={`${row.company}-${i}`} row={row} index={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {rows.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#ccc" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14 }}>Upload an Excel file to get started</div>
          </div>
        )}

      </div>
    </div>
  );
}
