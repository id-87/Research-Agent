import { useRef, useState } from "react";
import { parseCompaniesFromFile } from "../lib/excelParser.js";

export function FileUpload({ onLoad, disabled }) {
  const fileRef = useRef();
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handleFile = async (file) => {
    setError(null);
    try {
      const companies = await parseCompaniesFromFile(file);
      setFileName(`${file.name} — ${companies.length} companies`);
      onLoad(companies);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !disabled && fileRef.current.click()}
        style={{
          border: "1.5px dashed #ddd",
          borderRadius: 10,
          padding: "24px 20px",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          background: "#fafafa",
          transition: "border-color 0.15s",
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>📂</div>
        <div style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>
          {fileName || "Drop your Excel file here, or click to browse"}
        </div>
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
          .xlsx · .xls · .csv · Column A: Company name · Column B: Location (optional)
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#A32D2D", background: "#fcebeb", padding: "8px 12px", borderRadius: 6 }}>
          {error}
        </div>
      )}
    </div>
  );
}
