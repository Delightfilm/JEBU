import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { monthlyTimetable } from "@/data/timetable";
import type { TimetableEntry } from "@/data/timetable";

const monthlyData = monthlyTimetable;

const formatTimeRange = (open: string, close: string) =>
  open === "00:00" && close === "23:59" ? "계속통행" : `${open} ~ ${close}`;

const MonthlyTimetable = () => {
  const currentMonth = new Date().getMonth() + 1;
  const d = new Date();
  const today = `${d.getMonth() + 1}/${d.getDate()}`;

  const months = [
    { value: "1", label: "1월" },
    { value: "2", label: "2월" },
    { value: "3", label: "3월" },
    { value: "4", label: "4월" },
    { value: "5", label: "5월" },
    { value: "6", label: "6월" },
    { value: "7", label: "7월" },
    { value: "8", label: "8월" },
    { value: "9", label: "9월" },
    { value: "10", label: "10월" },
    { value: "11", label: "11월" },
    { value: "12", label: "12월" },
  ];

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">월별 통행 시간표</h3>
      </div>

      <Tabs defaultValue={String(currentMonth)} className="w-full">
        <div className="border-b border-border bg-muted/30 px-4 py-2">
          <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
            {months.map((month) => (
              <TabsTrigger
                key={month.value}
                value={month.value}
                className="rounded-full px-3 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {month.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {months.map((month) => (
          <TabsContent key={month.value} value={month.value} className="mt-0">
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
                  {monthlyData[month.value] ? (
                    monthlyData[month.value].map((entry, index) => {
                      const isToday = entry.date === today;
                      const isSat = entry.dayOfWeek === "토";
                      const isSun = entry.dayOfWeek === "일";
                      const rowBg =
                        isToday
                          ? "bg-status-open-light"
                          : isSun
                            ? "bg-[#FFEBEB] hover:bg-[#FFE0E0]"
                            : isSat
                              ? "bg-[#E8F1FF] hover:bg-[#D6E5FF]"
                              : "hover:bg-muted/30";
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
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        {month.label} 데이터가 아직 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="border-t border-border bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground">
          ※ 시간은 조석 예보에 따라 변동될 수 있습니다
        </p>
      </div>
    </div>
  );
};

export default MonthlyTimetable;
