import tideFeb from "./tide-202602.json";
import tideMar from "./tide-202603.json";
import tideApr from "./tide-202604.json";

export interface TideEvent {
  time: string;
  type: "고" | "저";
  level: number;
}

export interface TideDay {
  date: string;
  events: TideEvent[];
}

const tide202602: TideDay[] = tideFeb as TideDay[];
const tide202603: TideDay[] = tideMar as TideDay[];
const tide202604: TideDay[] = tideApr as TideDay[];

const allTideDays: TideDay[] = [...tide202602, ...tide202603, ...tide202604];

const tideByDate = new Map<string, TideDay>(allTideDays.map((d) => [d.date, d]));

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** YYYY-MM-DD 형식으로 오늘 날짜 */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 오늘 날짜에 대한 조석 데이터 키.
 * 데이터가 없는 날짜면, 사용 가능한 날짜 중 가장 가까운 과거(없으면 가장 이른 날짜)로 fallback합니다.
 */
function effectiveTideKey(): string {
  const key = todayKey();
  if (tideByDate.has(key)) return key;

  const dates = allTideDays.map((d) => d.date).sort();
  if (dates.length === 0) return key;

  // yyyy-mm-dd 문자열은 사전식 정렬이 날짜 정렬과 동일
  const pastOrEqual = dates.filter((d) => d <= key);
  return pastOrEqual[pastOrEqual.length - 1] ?? dates[0];
}

/** 해당 날짜의 조석 이벤트 (2026년 2월만 데이터 있음) */
export function getTideForDate(dateKey: string): TideDay | null {
  return tideByDate.get(dateKey) ?? null;
}

/** 오늘 조석 이벤트 (시간순 정렬, 당일+자정 넘는 다음날 첫 이벤트 포함) */
export function getTodayTideEvents(): TideEvent[] {
  const key = effectiveTideKey();
  const day = getTideForDate(key);
  if (!day || !day.events.length) return [];
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return day.events
    .map((e) => ({ ...e, minutes: toMinutes(e.time) }))
    .sort((a, b) => a.minutes - b.minutes);
}

/** 현재 시각 기준 수위 보간 및 다음 만조/간조 정보 */
export function getCurrentTideStatus(): {
  levelPercent: number;
  levelLabel: string;
  nextHigh: TideEvent | null;
  nextLow: TideEvent | null;
  prevHigh: TideEvent | null;
  prevLow: TideEvent | null;
} {
  const day = getTideForDate(effectiveTideKey());
  if (!day || !day.events.length) {
    return { levelPercent: 50, levelLabel: "데이터 없음", nextHigh: null, nextLow: null, prevHigh: null, prevLow: null };
  }
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const events = day.events.map((e) => ({ ...e, minutes: toMinutes(e.time) })).sort((a, b) => a.minutes - b.minutes);

  let prev: (TideEvent & { minutes: number }) | null = null;
  let next: (TideEvent & { minutes: number }) | null = null;
  for (const e of events) {
    if (e.minutes <= nowMins) prev = e;
    if (e.minutes > nowMins && !next) next = e;
  }
  if (!next && events.length) next = events[0];

  const prevHigh = events.filter((e) => e.type === "고").reverse().find((e) => e.minutes <= nowMins) ?? null;
  const nextHigh = events.find((e) => e.type === "고" && e.minutes > nowMins) ?? events.find((e) => e.type === "고") ?? null;
  const prevLow = events.filter((e) => e.type === "저").reverse().find((e) => e.minutes <= nowMins) ?? null;
  const nextLow = events.find((e) => e.type === "저" && e.minutes > nowMins) ?? events.find((e) => e.type === "저") ?? null;

  let levelPercent = 50;
  let levelLabel = "예측 불가";

  if (prev && next) {
    const range = next.minutes - prev.minutes;
    const elapsed = nowMins - prev.minutes;
    const t = range <= 0 ? 0.5 : Math.max(0, Math.min(1, elapsed / range));
    const low = prev.type === "저" ? (prev.level ?? 0) : next.type === "저" ? (next.level ?? 0) : Math.min(prev.level ?? 0, next.level ?? 0);
    const high = prev.type === "고" ? (prev.level ?? 0) : next.type === "고" ? (next.level ?? 0) : Math.max(prev.level ?? 0, next.level ?? 0);
    if (prev.type === "고" && next.type === "저") {
      levelPercent = 100 - t * 100;
      const levelCm = high - (high - low) * t;
      levelLabel = `약 ${(levelCm / 100).toFixed(1)}m (하강 중)`;
    } else if (prev.type === "저" && next.type === "고") {
      levelPercent = t * 100;
      const levelCm = low + (high - low) * t;
      levelLabel = `약 ${(levelCm / 100).toFixed(1)}m (상승 중)`;
    }
  }

  return {
    levelPercent,
    levelLabel,
    nextHigh: nextHigh ? { time: nextHigh.time, type: nextHigh.type, level: nextHigh.level } : null,
    nextLow: nextLow ? { time: nextLow.time, type: nextLow.type, level: nextLow.level } : null,
    prevHigh: prevHigh ? { time: prevHigh.time, type: prevHigh.type, level: prevHigh.level } : null,
    prevLow: prevLow ? { time: prevLow.time, type: prevLow.type, level: prevLow.level } : null,
  };
}

/** 2026년 2월 조석 예보 전체 (표용) */
export function getTideForecastFebruary(): TideDay[] {
  return tide202602;
}

/** 2026년 3월 조석 예보 전체 (표용) */
export function getTideForecastMarch(): TideDay[] {
  return tide202603;
}

/** 2026년 4월 조석 예보 전체 (표용) */
export function getTideForecastApril(): TideDay[] {
  return tide202604;
}

/** 24시간 곡선용 데이터 포인트 (만조/간조 기준 보간) */
export interface TideCurvePoint {
  minutes: number;
  level: number;
  label: string;
}

const INTERVAL_MINUTES = 30;

/** 오늘 0시~24시 구간의 수위 곡선 데이터 (그래프용) */
export function getTideCurveData(): TideCurvePoint[] {
  const day = getTideForDate(effectiveTideKey());
  if (!day || !day.events.length) {
    return Array.from({ length: 96 + 1 }, (_, i) => ({
      minutes: i * INTERVAL_MINUTES,
      level: 400,
      label: `${Math.floor((i * INTERVAL_MINUTES) / 60)}:${String((i * INTERVAL_MINUTES) % 60).padStart(2, "0")}`,
    }));
  }
  const events = day.events.map((e) => ({ ...e, minutes: toMinutes(e.time) })).sort((a, b) => a.minutes - b.minutes);
  const points: TideCurvePoint[] = [];
  for (let min = 0; min <= 24 * 60; min += INTERVAL_MINUTES) {
    let level = 400;
    const prev = events.filter((e) => e.minutes <= min).pop();
    const next = events.find((e) => e.minutes > min) ?? events[0];
    if (prev && next) {
      const range = (next.minutes < prev.minutes ? next.minutes + 24 * 60 - prev.minutes : next.minutes - prev.minutes) || 1;
      const elapsed = next.minutes < prev.minutes
        ? (min >= prev.minutes ? min - prev.minutes : min + 24 * 60 - prev.minutes)
        : min - prev.minutes;
      const t = Math.max(0, Math.min(1, elapsed / range));
      const low = prev.type === "저" ? (prev.level ?? 0) : next.type === "저" ? (next.level ?? 0) : Math.min(prev.level ?? 0, next.level ?? 0);
      const high = prev.type === "고" ? (prev.level ?? 0) : next.type === "고" ? (next.level ?? 0) : Math.max(prev.level ?? 0, next.level ?? 0);
      level = prev.type === "저" ? low + (high - low) * t : high - (high - low) * t;
    } else if (prev) level = prev.level ?? 400;
    else if (next) level = next.level ?? 400;
    const h = Math.floor(min / 60);
    const m = min % 60;
    points.push({
      minutes: min,
      level,
      label: `${h}:${String(m).padStart(2, "0")}`,
    });
  }
  return points;
}

/** 다음 만조/간조까지 남은 시간 문자열 */
export function getTimeUntilNextTide(): { nextHighText: string; nextLowText: string } {
  const status = getCurrentTideStatus();
  const now = new Date();
  const formatRemaining = (event: TideEvent | null) => {
    if (!event) return "—";
    const [eh, em] = event.time.split(":").map(Number);
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh ?? 0, em ?? 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const diff = next.getTime() - now.getTime();
    if (diff <= 0) return "—";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  };
  return {
    nextHighText: formatRemaining(status.nextHigh),
    nextLowText: formatRemaining(status.nextLow),
  };
}
