import { useState, useEffect } from "react";

const STORAGE_KEYS = {
  total: "jebu_visitor_total",
  date: "jebu_visitor_date",
  today: "jebu_visitor_today",
} as const;

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadCounts(): { today: number; total: number } {
  if (typeof window === "undefined") return { today: 0, total: 0 };
  const todayKey = getTodayKey();
  const storedTotal = localStorage.getItem(STORAGE_KEYS.total);
  const storedDate = localStorage.getItem(STORAGE_KEYS.date);
  const storedToday = localStorage.getItem(STORAGE_KEYS.today);

  let total = storedTotal ? parseInt(storedTotal, 10) : 0;
  let today = 0;

  if (storedDate === todayKey && storedToday) {
    today = parseInt(storedToday, 10);
  }

  total += 1;
  today += 1;

  localStorage.setItem(STORAGE_KEYS.total, String(total));
  localStorage.setItem(STORAGE_KEYS.date, todayKey);
  localStorage.setItem(STORAGE_KEYS.today, String(today));

  return { today, total };
}

const VisitorCounter = () => {
  const [counts, setCounts] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    setCounts(loadCounts());
  }, []);

  if (counts === null) return null;

  return (
    <div className="rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <span className="text-foreground">
          <span className="text-muted-foreground">오늘</span>{" "}
          <span className="font-bold tabular-nums">{counts.today.toLocaleString()}</span>
        </span>
        <span className="text-foreground">
          <span className="text-muted-foreground">전체</span>{" "}
          <span className="font-bold tabular-nums">{counts.total.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
};

export default VisitorCounter;
