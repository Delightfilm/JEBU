import { useState, useEffect } from "react";
import { incrementVisitor } from "@/lib/supabase";

const VisitorCounter = () => {
  const [counts, setCounts] = useState<{ today: number; total: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let ip = "unknown";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (res.ok) {
          const json = (await res.json()) as { ip?: string };
          if (json.ip) ip = json.ip;
        }
      } catch {
        // IP 조회 실패 시 'unknown' 유지
      }

      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const path = typeof window !== "undefined" ? window.location.pathname : "";

      const result = await incrementVisitor(ip, userAgent, path);
      if (cancelled) return;
      if (result) {
        setCounts(result);
        setError(false);
      } else {
        setError(true);
        setCounts({ today: 0, total: 0 });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (counts === null && !error) return null;

  return (
    <div className="rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <span className="text-foreground">
          <span className="text-muted-foreground">오늘</span>{" "}
          <span className="font-bold tabular-nums">
            {(counts?.today ?? 0).toLocaleString()}
          </span>
        </span>
        <span className="text-foreground">
          <span className="text-muted-foreground">전체</span>{" "}
          <span className="font-bold tabular-nums">
            {(counts?.total ?? 0).toLocaleString()}
          </span>
        </span>
      </div>
      {error && (
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          Supabase 미설정 또는 연결 실패
        </p>
      )}
    </div>
  );
};

export default VisitorCounter;
