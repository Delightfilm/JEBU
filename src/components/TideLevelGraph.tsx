import { useState, useEffect } from "react";
import { Waves } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getTideCurveData,
  getCurrentTideStatus,
  getTimeUntilNextTide,
} from "@/data/tide";

const formatTimeLabel = (minutes: number) => {
  if (minutes === 0) return "오전 12시";
  if (minutes === 360) return "오전 6시";
  if (minutes === 720) return "오후 12시";
  if (minutes === 1080) return "오후 6시";
  return "";
};

/** cm → m 소수점 한 자리 표시 */
const cmToM = (cm: number) => (cm / 100).toFixed(1);

/** currentMinutes에 대한 수위 선형 보간 (곡선 위 정확한 Y값) */
function interpolateLevel(
  curveData: { minutes: number; level: number }[],
  currentMinutes: number
): number {
  if (!curveData.length) return 0;
  const sorted = [...curveData].sort((a, b) => a.minutes - b.minutes);
  let prev = sorted[sorted.length - 1];
  let next = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].minutes <= currentMinutes) prev = sorted[i];
    if (sorted[i].minutes >= currentMinutes) {
      next = sorted[i];
      break;
    }
    next = sorted[i];
  }
  const wrap = next.minutes < prev.minutes;
  const range = wrap
    ? 24 * 60 - prev.minutes + next.minutes
    : next.minutes - prev.minutes;
  const elapsed = wrap
    ? currentMinutes >= prev.minutes
      ? currentMinutes - prev.minutes
      : currentMinutes + (24 * 60 - prev.minutes)
    : currentMinutes - prev.minutes;
  const t = range <= 0 ? 0 : Math.max(0, Math.min(1, elapsed / range));
  return prev.level + (next.level - prev.level) * t;
}

const TideLevelGraph = () => {
  const [curveData, setCurveData] = useState(() => getTideCurveData());
  const [status, setStatus] = useState(() => getCurrentTideStatus());
  const [timeUntil, setTimeUntil] = useState(() => getTimeUntilNextTide());
  const [now, setNow] = useState(() => new Date());
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      setCurveData(getTideCurveData());
      setStatus(getCurrentTideStatus());
      setTimeUntil(getTimeUntilNextTide());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const levelMin = Math.min(...curveData.map((d) => d.level));
  const levelMax = Math.max(...curveData.map((d) => d.level));
  const levelMid = (levelMin + levelMax) / 2;
  const yDomain = [Math.max(0, levelMin - 50), levelMax + 50];

  /** 현재 시각에 대한 선형 보간 수위 */
  const currentLevel = interpolateLevel(curveData, currentMinutes);

  /** 그래프용 데이터: 현재 시각 한 점을 삽입해 해당 위치에 파란 점만 그림 */
  const chartData = (() => {
    const point = {
      minutes: currentMinutes,
      level: currentLevel,
      label: "",
      isCurrent: true,
    };
    const arr = curveData.filter((d) => !("isCurrent" in d));
    const idx = arr.findIndex((p) => p.minutes >= currentMinutes);
    if (idx < 0) return [...arr, point];
    return [...arr.slice(0, idx), point, ...arr.slice(idx)];
  })();

  /** 30분 단위에 가장 가까운 minutes (툴팁 스냅용) */
  const snapTo30 = (minutes: number) => Math.round(minutes / 30) * 30;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm"
      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-sky-600" aria-hidden />
          <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
            현재 수위
          </h3>
        </div>
      </div>

      {/* 상단 텍스트 정보 (애플 날씨 앱 스타일) */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[28px] font-semibold tracking-tight text-[#1D1D1F]">
          {status.levelLabel}
        </p>
        <p className="mt-1.5 text-[13px] text-[#1D1D1F]/70">
          다음 만조까지{" "}
          <span className="font-medium text-[#1D1D1F]">
            {timeUntil.nextHighText}
          </span>
          {" · "}
          다음 간조까지{" "}
          <span className="font-medium text-[#1D1D1F]">
            {timeUntil.nextLowText}
          </span>
        </p>
      </div>

      {/* 그래프 영역 */}
      <div className="px-4 pb-4 pt-2">
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
            >
              <defs>
                <linearGradient
                  id="tideGradientLight"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(14, 165, 233, 0.35)"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgba(2, 132, 199, 0.12)"
                  />
                </linearGradient>
                <filter id="currentDotGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                vertical={true}
                horizontal={true}
              />
              <XAxis
                dataKey="minutes"
                type="number"
                domain={[0, 24 * 60]}
                tickFormatter={formatTimeLabel}
                ticks={[0, 360, 720, 1080]}
                stroke="rgba(0,0,0,0.25)"
                tick={{ fill: "#1D1D1F", fontSize: 11, opacity: 0.7 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={yDomain} hide />
              <ReferenceLine
                y={levelMid}
                stroke="#d1d5db"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                }}
                labelFormatter={(minutes: number) => {
                  const snapped = snapTo30(minutes);
                  const h = Math.floor(snapped / 60);
                  const m = snapped % 60;
                  return `${h}시 ${m}분`;
                }}
                formatter={(value: number) => [`${cmToM(value)}m`, "수위"]}
                labelStyle={{ color: "#1D1D1F", fontSize: 13 }}
                itemStyle={{ color: "#1D1D1F", fontSize: 13 }}
                cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "3 2" }}
              />
              <Area
                type="monotone"
                dataKey="level"
                stroke="rgb(2, 132, 199)"
                strokeWidth={1.8}
                fill="url(#tideGradientLight)"
                dot={(props: {
                  cx: number;
                  cy: number;
                  payload: { isCurrent?: boolean };
                }) => {
                  if (!props.payload?.isCurrent) return null;
                  const { cx, cy } = props;
                  return (
                    <g key="current" transform={`translate(${cx},${cy})`}>
                      <circle
                        r={8}
                        fill="white"
                        fillOpacity={0.5}
                        filter="url(#currentDotGlow)"
                      />
                      <circle
                        r={4}
                        fill="rgb(3, 105, 161)"
                        stroke="white"
                        strokeWidth={1.2}
                        strokeOpacity={0.9}
                      />
                    </g>
                  );
                }}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 푸터 */}
      <div className="border-t border-gray-100 px-5 py-2.5">
        <p className="text-[11px] text-[#1D1D1F]/55">
          ※ 2026년 2월 예보 기준
        </p>
      </div>
    </div>
  );
};

export default TideLevelGraph;
