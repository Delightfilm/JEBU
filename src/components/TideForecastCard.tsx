import { Waves } from "lucide-react";
import { getTideForecastFebruary } from "@/data/tide";
import type { TideDay, TideEvent } from "@/data/tide";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function formatEvent(e: TideEvent): string {
  const type = e.type === "고" ? "만조" : "간조";
  return e.level != null ? `${e.time} ${type} ${e.level}cm` : `${e.time} ${type}`;
}

const TideForecastCard = () => {
  const data = getTideForecastFebruary();
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div className="card-elevated overflow-hidden">
      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value="tide-feb" className="border-none">
          <AccordionTrigger className="border-b border-border bg-muted/50 px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-ocean" />
              <h3 className="font-semibold">2026년 2월 조석 예보 (궁평항)</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 pt-0">
            <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                날짜
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                극치조위 1
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                극치조위 2
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                극치조위 3
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                극치조위 4
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => {
              const isToday = day.date === todayStr;
              const dateObj = new Date(day.date);
              const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
              const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${dayOfWeek})`;
              const isSat = dayOfWeek === "토";
              const isSun = dayOfWeek === "일";
              const rowBg = isToday
                ? "bg-status-open-light"
                : isSun
                  ? "bg-[#FFEBEB] hover:bg-[#FFE0E0]"
                  : isSat
                    ? "bg-[#E8F1FF] hover:bg-[#D6E5FF]"
                    : "hover:bg-muted/30";
              return (
                <tr
                  key={day.date}
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
                        {dateLabel}
                      </span>
                    </div>
                  </td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="px-4 py-3">
                      <span className="text-sm">
                        {day.events[i] ? formatEvent(day.events[i]) : "-"}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
            </table>
            </div>

            <div className="border-t border-border bg-muted/30 px-4 py-2">
              <p className="text-xs text-muted-foreground">
                ※ 궁평항 조석 예보 기준이며, 제부도 현장과는 편차가 있을 수 있습니다.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TideForecastCard;
