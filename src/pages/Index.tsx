import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StatusDisplay from "@/components/StatusDisplay";
import TideLevelGraph from "@/components/TideLevelGraph";
import TimetableCard from "@/components/TimetableCard";
import MonthlyTimetable from "@/components/MonthlyTimetable";
import TideForecastCard from "@/components/TideForecastCard";
import TideGuide from "@/components/TideGuide";
import { getPassStatus, getWeekEntries } from "@/data/timetable";

const Index = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [nextChangeTime, setNextChangeTime] = useState(new Date());
  const weekEntries = getWeekEntries();

  useEffect(() => {
    const { isOpen: open, nextChangeTime: next } = getPassStatus();
    setIsOpen(open);
    setNextChangeTime(next);
    const interval = setInterval(() => {
      const updated = getPassStatus();
      setIsOpen(updated.isOpen);
      setNextChangeTime(updated.nextChangeTime);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* 메인 상태 표시 */}
          <section>
            <StatusDisplay isOpen={isOpen} nextChangeTime={nextChangeTime} />
          </section>

          {/* 현재 수위 그래프 (이번 주 시간표 위) */}
          <section className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <TideLevelGraph />
          </section>

          {/* 이번 주 시간표 */}
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <TimetableCard entries={weekEntries} />
          </section>

          {/* 월별 시간표 */}
          <section className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <MonthlyTimetable />
          </section>

          {/* 2026년 2월 조석 예보 (월별 시간표 밑) */}
          <section className="animate-fade-in" style={{ animationDelay: "0.18s" }}>
            <TideForecastCard />
          </section>

          {/* 물때 가이드 */}
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <TideGuide />
          </section>

          {/* 푸터 정보 */}
          <footer className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              ※ 기상상태에 따라 바다갈라짐 발생 및 지속시간은 편차가 발생할 수 있습니다.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              문의: 제부도 관리 사무소 031-355-3924
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground/80">
              Copyright © 2022. Delight-Film. All Rights Reserved. / delightfilm0721@gmail.com
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
