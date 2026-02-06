import timetableJson from "./timetable.json";

export interface TimetableEntry {
  date: string;
  dayOfWeek: string;
  openTime1: string;
  closeTime1: string;
  openTime2?: string;
  closeTime2?: string;
}

export type MonthlyTimetable = Record<string, TimetableEntry[]>;

export const monthlyTimetable: MonthlyTimetable = timetableJson as MonthlyTimetable;

function parseTimeHM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** 오늘 날짜의 시간표 항목 반환 */
export function getTodayEntry(): TimetableEntry | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const key = String(month);
  const list = monthlyTimetable[key];
  if (!list) return null;
  return list.find((e) => e.date === `${month}/${day}`) ?? null;
}

/** 현재 시각이 통행 구간 안인지 (다음날 자정 넘는 close는 다음날 새벽으로 간주) */
function isInRange(nowMins: number, open: string, close: string): boolean {
  const openMins = parseTimeHM(open);
  let closeMins = parseTimeHM(close);
  if (closeMins <= openMins) closeMins += 24 * 60;
  return nowMins >= openMins && nowMins < closeMins;
}

/** 오늘 시간표 기준 통행 가능 여부와 다음 상태 변경 시각 */
export function getPassStatus(): {
  isOpen: boolean;
  nextChangeTime: Date;
} {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const entry = getTodayEntry();

  if (!entry) {
    return { isOpen: false, nextChangeTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0) };
  }

  const in1 = isInRange(nowMins, entry.openTime1, entry.closeTime1);
  const in2 = entry.openTime2 && entry.closeTime2
    ? isInRange(nowMins, entry.openTime2, entry.closeTime2)
    : false;
  const isOpen = in1 || in2;

  const candidates: Date[] = [];
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  function addIfFuture(openStr: string, closeStr: string) {
    const [oh, om] = openStr.split(":").map(Number);
    const [ch, cm] = closeStr.split(":").map(Number);
    let closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch ?? 0, cm ?? 0, 0);
    if (closeDate <= now && (ch ?? 0) < 12) {
      closeDate = new Date(closeDate.getTime() + 24 * 60 * 60 * 1000);
    }
    if (closeDate > now) candidates.push(closeDate);
    const openDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), oh ?? 0, om ?? 0, 0);
    if (openDate > now) candidates.push(openDate);
  }

  addIfFuture(entry.openTime1, entry.closeTime1);
  if (entry.openTime2 && entry.closeTime2) addIfFuture(entry.openTime2, entry.closeTime2);

  const nextChangeTime = candidates.length > 0
    ? candidates.sort((a, b) => a.getTime() - b.getTime())[0]
    : new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return { isOpen, nextChangeTime };
}

/** 이번 주(일~토) 시간표 항목 목록 (오늘 기준 앞뒤로 일주일) */
export function getWeekEntries(): TimetableEntry[] {
  const now = new Date();
  const result: TimetableEntry[] = [];
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const key = String(month);
    const list = monthlyTimetable[key];
    if (!list) continue;
    const entry = list.find((e) => e.date === `${month}/${day}`);
    if (entry) result.push(entry);
  }
  return result;
}
