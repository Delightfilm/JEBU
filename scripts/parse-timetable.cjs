const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = path.join(process.env.USERPROFILE || "", "Downloads", "2026년 제부도 바닷길 시간표.xlsx");
const outPath = path.join(__dirname, "..", "src", "data", "timetable.json");

const workbook = XLSX.readFile(excelPath);
const sheetNames = workbook.SheetNames;
console.log("시트 목록:", sheetNames);

const result = { monthly: {}, rawSheets: {} };

for (const name of sheetNames) {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  result.rawSheets[name] = data;
  console.log("\n시트:", name);
  console.log("처음 15행:", JSON.stringify(data.slice(0, 15), null, 2));
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath.replace("timetable.json", "timetable-raw.json"), JSON.stringify(result, null, 2), "utf8");
console.log("\n원본 구조 저장: src/data/timetable-raw.json");
