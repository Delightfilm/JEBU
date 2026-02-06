import data from "./timetable.json";

export interface TimetableEntry {
  date: string;
  dayOfWeek: string;
  openTime1: string;
  closeTime1: string;
  openTime2?: string;
  closeTime2?: string;
}

const timetable = data as Record<string, TimetableEntry[]>;

/** "HH:mm" → 당일 0시 기준 분 */
function toMinutes(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

/** 오늘 날짜 키 (월/일) */
function todayKey(): string {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()}`;
}

/** 해당 월의 통행 데이터 배열 (월별 시간표용) */
export function getMonthEntries(month: number): TimetableEntry[] {
  const key = String(month);
  return timetable[key] ?? [];
}

/** 오늘 하루 통행 엔트리 */
function getTodayEntry(): TimetableEntry | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const entries = getMonthEntries(month);
  const entry = entries.find((e) => {
    const [m, d] = e.date.split("/").map(Number);
    return m === month && d === day;
  });
  return entry ?? null;
}

/** 한 구간이 자정을 넘는지 (close < open 이면 다음날) */
function isOvernight(openMin: number, closeMin: number): boolean {
  return closeMin <= openMin;
}

/** 현재 시각이 [open, close) 구간 안에 있는지 (자정 넘김 처리) */
function isInInterval(nowMin: number, openMin: number, closeMin: number): boolean {
  if (isOvernight(openMin, closeMin)) {
    return nowMin >= openMin || nowMin < closeMin;
  }
  return nowMin >= openMin && nowMin < closeMin;
}

/** 분 → 오늘 자정 기준 Date (다음날이면 +1일) */
function toDateToday(now: Date, minutes: number): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (minutes >= 24 * 60) {
    d.setDate(d.getDate() + 1);
    d.setMinutes(minutes - 24 * 60);
  } else {
    d.setMinutes(minutes);
  }
  return d;
}

/** 다음 상태 변경 시각 (다음 open 또는 close) */
function nextChange(nowMin: number, entry: TimetableEntry): Date {
  const now = new Date();
  const candidates: Date[] = [];
  const add = (openMin: number, closeMin: number) => {
    candidates.push(toDateToday(now, closeMin > openMin ? closeMin : closeMin + 24 * 60));
    candidates.push(toDateToday(now, openMin));
  };
  add(toMinutes(entry.openTime1), toMinutes(entry.closeTime1));
  if (entry.openTime2 && entry.closeTime2) {
    add(toMinutes(entry.openTime2), toMinutes(entry.closeTime2));
  }
  const next = candidates
    .filter((d) => d.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime())[0];
  return next ?? new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

/** 오늘 시간표 기준 통행 가능 여부와 다음 상태 변경 시각 */
export function getPassStatus(): {
  isOpen: boolean;
  nextChangeTime: Date;
} {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const entry = getTodayEntry();

  if (!entry) {
    return {
      isOpen: false,
      nextChangeTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  const open1 = toMinutes(entry.openTime1);
  const close1 = toMinutes(entry.closeTime1);
  let isOpen = isInInterval(nowMin, open1, close1);
  if (entry.openTime2 && entry.closeTime2) {
    const open2 = toMinutes(entry.openTime2);
    const close2 = toMinutes(entry.closeTime2);
    isOpen = isOpen || isInInterval(nowMin, open2, close2);
  }

  return {
    isOpen,
    nextChangeTime: nextChange(nowMin, entry),
  };
}

/** 이번 주(오늘 포함 7일) 통행 시간표 엔트리 */
export function getWeekEntries(): TimetableEntry[] {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const entries = getMonthEntries(month);
  if (!entries.length) return [];

  const dayIndex = entries.findIndex((e) => {
    const [m, d] = e.date.split("/").map(Number);
    return m === month && d === day;
  });
  if (dayIndex < 0) return [];

  const result: TimetableEntry[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = dayIndex + i;
    if (idx < entries.length) {
      result.push(entries[idx]);
    } else {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextEntries = getMonthEntries(nextMonth);
      const j = idx - entries.length;
      if (j < nextEntries.length) result.push(nextEntries[j]);
    }
  }
  return result;
}
