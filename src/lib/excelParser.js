
import * as XLSX from "xlsx";

const HEADER_LABELS = ["company", "name", "business", "organisation", "organization", "sr", "s.no", "#"];

/**
 * @param {File} file
 * @returns {Promise<Array<{company: string, location: string}>>}
 */
export async function parseCompaniesFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        const companies = [];

        for (const row of rows) {
          const rawName = String(row[0] ?? "").trim();
          const rawLoc = String(row[1] ?? "").trim();

          if (!rawName) continue;
          if (HEADER_LABELS.includes(rawName.toLowerCase())) continue;

          companies.push({
            company: rawName,
            location: rawLoc || "India",
          });
        }

        if (companies.length === 0) {
          reject(new Error("No companies found in the file. Check that company names are in column A."));
        } else {
          resolve(companies);
        }
      } catch (err) {
        reject(new Error(`Could not parse file: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsBinaryString(file);
  });
}
