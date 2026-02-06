const XLSX = require("xlsx");
const path = require("path");

const excelPath = path.join(process.env.USERPROFILE || "", "Downloads", "[Hilow]202602 궁평항.xls");
const workbook = XLSX.readFile(excelPath);
console.log("시트 목록:", workbook.SheetNames);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  console.log("\n시트:", name, "행 수:", data.length);
  console.log("처음 25행:", JSON.stringify(data.slice(0, 25), null, 2));
}
