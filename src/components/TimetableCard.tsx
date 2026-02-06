import { Calendar } from "lucide-react";
import { formatTimeRange } from "@/data/timetable";

interface TimetableEntry {
  date: string;
  dayOfWeek: string;
  openTime1: string;
  closeTime1: string;
  openTime2?: string;
  closeTime2?: string;
}

interface TimetableCardProps {
  entries: TimetableEntry[];
}

const TimetableCard = ({ entries }: TimetableCardProps) => {
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">이번 주 통행 시간표</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                날짜
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                1차 통행
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                2차 통행
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const isToday = entry.date === today;
              const isSat = entry.dayOfWeek === "토";
              const isSun = entry.dayOfWeek === "일";
              const rowBg = isSat ? "bg-blue-100/60" : isSun ? "bg-red-100/60" : isToday ? "bg-status-open-light" : "hover:bg-muted/30";
              return (
                <tr
                  key={index}
                  className={`border-b border-border/50 transition-colors ${rowBg}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                          오늘
                        </span>
                      )}
                      <span className={`font-medium ${isToday ? "text-foreground" : ""}`}>
                        {entry.date}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({entry.dayOfWeek})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {formatTimeRange(entry.openTime1, entry.closeTime1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.openTime2 && entry.closeTime2 ? (
                      <span className="text-sm">
                        {formatTimeRange(entry.openTime2, entry.closeTime2)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground">
          ※ 시간은 조석 예보에 따라 변동될 수 있습니다
        </p>
      </div>
    </div>
  );
};

export default TimetableCard;
