import { useState, useEffect } from "react";
import { Waves } from "lucide-react";
import { getCurrentTideStatus } from "@/data/tide";

const CurrentWaterLevelCard = () => {
  const [status, setStatus] = useState(() => getCurrentTideStatus());

  useEffect(() => {
    const interval = setInterval(() => setStatus(getCurrentTideStatus()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const percent = Math.round(status.levelPercent);
  const nextHigh = status.nextHigh;
  const nextLow = status.nextLow;

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <Waves className="h-5 w-5 text-ocean" />
        <h3 className="font-semibold">현재 수위</h3>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-6 items-center">
          {/* 수위 게이지 */}
          <div className="flex flex-col items-center gap-1 min-w-[72px]">
            <span className="text-xs font-medium text-muted-foreground">만조</span>
            <div className="relative w-6 h-32 rounded-full bg-muted overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-ocean transition-all duration-500"
                style={{ height: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">{percent}%</span>
            <span className="text-xs text-muted-foreground">간조</span>
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-foreground">{status.levelLabel}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {nextHigh && (
                <p>
                  다음 만조 <span className="font-medium text-foreground">{nextHigh.time}</span>
                  {nextHigh.level != null && <span> ({nextHigh.level}cm)</span>}
                </p>
              )}
              {nextLow && (
                <p>
                  다음 간조 <span className="font-medium text-foreground">{nextLow.time}</span>
                  {nextLow.level != null && <span> ({nextLow.level}cm)</span>}
                </p>
              )}
              {!nextHigh && !nextLow && <p>오늘 조석 데이터가 없습니다.</p>}
            </div>
            <p className="text-xs text-muted-foreground">※ 2026년 2월 예보 기준</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWaterLevelCard;
