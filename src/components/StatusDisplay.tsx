import { useEffect, useState } from "react";
import roadOpenImage from "@/assets/road-open.png";
import roadClosedImage from "@/assets/road-closed.png";

interface StatusDisplayProps {
  isOpen: boolean;
  nextChangeTime: Date;
}

const StatusDisplay = ({ isOpen, nextChangeTime }: StatusDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = nextChangeTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextChangeTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="w-full animate-fade-in">
      {/* Status Image */}
      <div className="relative mb-6 flex justify-center">
        <div className="overflow-hidden rounded-2xl shadow-lg shadow-foreground/10">
          <img
            src={isOpen ? roadOpenImage : roadClosedImage}
            alt={isOpen ? "바닷길이 열린 모습" : "바닷길이 잠긴 모습"}
            className="h-48 w-full max-w-md object-cover sm:h-64"
          />
        </div>
      </div>

      {/* Status Badge & Text */}
      <div className="mb-6 text-center">
        <div
          className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            isOpen ? "status-badge-open" : "status-badge-closed"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOpen ? "bg-status-open animate-pulse-soft" : "bg-status-closed"
            }`}
          />
          {isOpen ? "통행 가능" : "통행 불가"}
        </div>

        <h2
          className={`text-2xl font-bold sm:text-3xl ${
            isOpen ? "text-status-open-foreground" : "text-status-closed-foreground"
          }`}
        >
          {isOpen ? "현재 통행 가능합니다" : "현재 통행이 제한되었습니다"}
        </h2>

        <p className="mt-2 text-muted-foreground">
          {isOpen
            ? "지금 바닷길을 건널 수 있어요"
            : "바닷물이 차올라 길이 잠겼어요"}
        </p>
      </div>

      {/* Countdown */}
      <div className="card-elevated mx-auto max-w-sm p-6">
        <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
          {isOpen ? "남은 통행 시간" : "다음 개방까지"}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="text-center">
            <div className="countdown-digit">{formatNumber(timeLeft.hours)}</div>
            <span className="mt-1 block text-xs text-muted-foreground">시간</span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <div className="text-center">
            <div className="countdown-digit">{formatNumber(timeLeft.minutes)}</div>
            <span className="mt-1 block text-xs text-muted-foreground">분</span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <div className="text-center">
            <div className="countdown-digit">{formatNumber(timeLeft.seconds)}</div>
            <span className="mt-1 block text-xs text-muted-foreground">초</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
