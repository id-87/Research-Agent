import { useState } from "react";

const STATUS_CONFIG = {
  pending:          { label: "Queued",                      color: "#888",    bg: "#f0f0f0" },
  researching:      { label: "Agent 01: Researching…",      color: "#185FA5", bg: "#e6f1fb" },
  finding_contacts: { label: "Agent 02: Finding contacts…", color: "#0F6E56", bg: "#e1f5ee" },
  writing_outreach: { label: "Agent 03: Writing outreach…", color: "#854F0B", bg: "#faeeda" },
  done:             { label: "Complete",                     color: "#3B6D11", bg: "#eaf3de" },
  partial:          { label: "Partial results",              color: "#854F0B", bg: "#faeeda" },
  error:            { label: "Failed",                       color: "#A32D2D", bg: "#fcebeb" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 999,
      background: cfg.bg, color: cfg.color, whiteSpace: "nowrap", display: "inline-block"
    }}>
      {cfg.label}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 6,
      border: "0.5px solid #ddd", background: "transparent",
      cursor: "pointer", color: copied ? "#3B6D11" : "#666",
      flexShrink: 0
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 500 }}>{label} </span>
      <span style={{ fontSize: 13, color: "#222" }}>{value}</span>
    </div>
  );
}

function ContactLink({ href, children }) {
  if (!href) return <span style={{ fontSize: 13 }}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer"
      style={{ fontSize: 13, color: "#185FA5", textDecoration: "none", wordBreak: "break-all" }}>
      {children}
    </a>
  );
}

export function ResultRow({ row, index }) {
  const [open, setOpen] = useState(false);
  const { company, location, profile, contact, outreach, errors, status } = row;
  const isExpandable = ["done", "partial"].includes(status);

  return (
    <div style={{ borderBottom: "0.5px solid #ececec" }}>

      {/* ── Header row ── */}
      <div
        onClick={() => isExpandable && setOpen(o => !o)}
        style={{
          display: "grid",
          gridTemplateColumns: "36px 1fr 200px 64px",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          cursor: isExpandable ? "pointer" : "default",
          background: open ? "#fafafa" : "transparent",
          transition: "background 0.15s",
        }}
      >
        <span style={{ fontSize: 12, color: "#ccc", fontFamily: "monospace", textAlign: "right" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#111" }}>{company}</div>
          {location && <div style={{ fontSize: 12, color: "#999", marginTop: 1 }}>{location}</div>}
        </div>
        <StatusBadge status={status} />
        <span style={{ fontSize: 12, color: "#aaa", textAlign: "right" }}>
          {isExpandable ? (open ? "▲" : "▼") : ""}
        </span>
      </div>

      {/* ── Expanded detail panel ── */}
      {open && isExpandable && (
        <div style={{ padding: "4px 20px 24px 68px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Partial/error notice */}
          {status === "partial" && Object.keys(errors || {}).length > 0 && (
            <div style={{
              gridColumn: "1 / -1", background: "#fff8ec", border: "0.5px solid #f5c47590",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#854F0B"
            }}>
              <strong>Partial results.</strong> Some agents encountered errors:{" "}
              {Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(" · ")}
            </div>
          )}

          {/* Business Profile */}
          <div style={{ gridColumn: "1 / -1", background: "#f7f7f5", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Business Profile — Agent 01
            </div>
            <p style={{ fontSize: 13, color: "#222", lineHeight: 1.65, margin: "0 0 10px" }}>
              {profile?.summary || "No summary available."}
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Field label="Industry" value={profile?.industry} />
              <Field label="Size" value={profile?.size_signals} />
              <Field label="Tools" value={profile?.tools_used} />
              {profile?.digital_presence?.website && (
                <div>
                  <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 500 }}>Website </span>
                  <a href={profile.digital_presence.website} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: "#185FA5" }}>
                    {profile.digital_presence.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div style={{ background: "#eef6ff", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#185FA5", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Contact Info — Agent 02
            </div>
            {contact?.not_found ? (
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                No contact information found in public directories.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {[
                    { label: "Phone", val: contact?.phone },
                    { label: "Email", val: contact?.email },
                    { label: "WhatsApp", val: contact?.whatsapp },
                    { label: "Website", val: contact?.website },
                  ].filter(r => r.val).map(({ label, val }) => (
                    <tr key={label}>
                      <td style={{ color: "#888", paddingBottom: 5, paddingRight: 12, whiteSpace: "nowrap", fontSize: 12 }}>{label}</td>
                      <td style={{ fontWeight: 500, paddingBottom: 5 }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {contact?.source_url && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid #b5d4f490" }}>
                <span style={{ fontSize: 11, color: "#888" }}>Source: </span>
                <ContactLink href={contact.source_url}>{contact.source_name || contact.source_url}</ContactLink>
                {contact.confidence && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: "#888" }}>· {contact.confidence} confidence</span>
                )}
              </div>
            )}
          </div>

          {/* Outreach Message */}
          <div style={{ background: "#f0faf4", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#3B6D11", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Outreach Message — Agent 03
              </div>
              {outreach && <CopyButton text={outreach} />}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#222", margin: 0, whiteSpace: "pre-wrap" }}>
              {outreach || "No message generated."}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
