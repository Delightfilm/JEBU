const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = path.join(process.env.USERPROFILE || "", "Downloads", "2026년 제부도 바닷길 시간표.xlsx");
const outPath = path.join(__dirname, "..", "src", "data", "timetable.json");

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function toTimeStr(val) {
  if (val === "" || val == null) return undefined;
  if (typeof val === "string") {
    const t = val.trim();
    if (t === "계속통행") return t;
    return t;
  }
  if (typeof val === "number") {
    const n = Math.floor(val);
    if (n < 0 || n > 2359) return undefined;
    const h = Math.floor(n / 100);
    const m = n % 100;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }
  return undefined;
}

function normalizeTime(val, isClose) {
  const s = toTimeStr(val);
  if (s === "계속통행") return isClose ? "23:59" : "00:00";
  return s;
}

/** 해당 연·월의 마지막 일(28~31) 반환 */
function getMaxDay(year, month) {
  return new Date(year, month, 0).getDate();
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets["2026년 제부도 통행시간표 (공표자료)"];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

const monthlyData = {};
const COLS_PER_MONTH = 7;
const DATA_START_ROW = 3;
const DATA_ROW_COUNT = 31;
const MONTHS_PER_BLOCK = 3;
const ROW_GAP_BETWEEN_BLOCKS = 1;
for (let month = 1; month <= 12; month++) {
  const blockIndex = Math.floor((month - 1) / MONTHS_PER_BLOCK);
  const colInBlock = (month - 1) % MONTHS_PER_BLOCK;
  const baseCol = colInBlock * COLS_PER_MONTH;
  const startRow = DATA_START_ROW + blockIndex * (DATA_ROW_COUNT + ROW_GAP_BETWEEN_BLOCKS);
  const endRow = startRow + DATA_ROW_COUNT;
  const entries = [];
  for (let r = startRow; r < endRow && r < rows.length; r++) {
    const row = rows[r];
    const day = row[baseCol];
    const dow = row[baseCol + 1];
    if (day === "" || day == null) continue;
    const dayNum = typeof day === "number" ? day : parseInt(String(day), 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) continue;

    const open1 = normalizeTime(row[baseCol + 2], false);
    const close1 = normalizeTime(row[baseCol + 3], true);
    const open2 = normalizeTime(row[baseCol + 4], false);
    const close2 = normalizeTime(row[baseCol + 5], true);

    entries.push({
      date: `${month}/${dayNum}`,
      dayNum,
      dayOfWeek: typeof dow === "string" ? dow.trim() : DAY_NAMES[new Date(2026, month - 1, dayNum).getDay()],
      openTime1: open1 || "",
      closeTime1: close1 || "",
      openTime2: open2 || undefined,
      closeTime2: close2 || undefined,
    });
  }
  const maxDay = getMaxDay(2026, month);
  const filtered = entries.filter((e) => e.dayNum >= 1 && e.dayNum <= maxDay);
  filtered.sort((a, b) => a.dayNum - b.dayNum);
  monthlyData[String(month)] = filtered.map(({ dayNum, ...rest }) => rest);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(monthlyData, null, 2), "utf8");
console.log("저장 완료:", outPath);
for (let m = 1; m <= 12; m++) {
  const max = getMaxDay(2026, m);
  const len = monthlyData[String(m)].length;
  const ok = len === max ? "OK" : len < max ? `부족(${max - len}일)` : `초과(${len - max}일)`;
  console.log(`${m}월: ${len}일 (기대: ${max}일) ${ok}`);
}
