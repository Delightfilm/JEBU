import { MapPin } from "lucide-react";

const Header = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container py-4">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">제부도 바닷길</h1>
              <p className="text-xs text-muted-foreground">실시간 통행 정보</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-sm font-medium text-foreground">{formattedDate}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
