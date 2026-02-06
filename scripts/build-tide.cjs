const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = path.join(process.env.USERPROFILE || "", "Downloads", "[Hilow]202602 궁평항.xls");
const outPath = path.join(__dirname, "..", "src", "data", "tide-202602.json");

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets["202602"];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

const HEADER_ROW = 3;
const result = [];

function parseCell(val) {
  if (val == null || val === "") return null;
  const s = String(val).trim();
  if (s.startsWith("--") || s === "-") return null;
  const parts = s.split("/");
  if (parts.length < 3) return null;
  const [time, type, levelStr] = parts;
  if (time.length < 5 || (type !== "고" && type !== "저")) return null;
  const level = parseInt(levelStr, 10);
  return { time, type, level: isNaN(level) ? null : level };
}

for (let r = HEADER_ROW + 1; r < rows.length; r++) {
  const row = rows[r];
  const dateStr = row[0];
  if (!dateStr || typeof dateStr !== "string" || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) continue;
  const events = [];
  for (let c = 1; c <= 4; c++) {
    const parsed = parseCell(row[c]);
    if (parsed) events.push(parsed);
  }
  result.push({ date: dateStr, events });
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log("저장 완료:", outPath, "일수:", result.length);
