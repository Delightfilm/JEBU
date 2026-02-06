import { Info, ChevronDown } from "lucide-react";
import { useState } from "react";

const TideGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card-elevated overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-ocean" />
          <span className="font-medium">물때 시간표 보는 법</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="animate-fade-in border-t border-border bg-muted/20 px-4 py-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="mb-1 font-medium text-foreground">물때란?</h4>
              <p>
                달의 인력에 의해 바닷물이 높아지고 낮아지는 현상을 말합니다. 
                제부도 바닷길은 간조(썰물) 시간에만 통행이 가능합니다.
              </p>
            </div>

            <div>
              <h4 className="mb-1 font-medium text-foreground">통행 시간 확인 방법</h4>
              <ul className="ml-4 list-disc space-y-1">
                <li>간조 시간 전후 약 2시간 동안 통행 가능</li>
                <li>하루에 보통 2번의 통행 시간대가 있음</li>
                <li>기상 상황에 따라 변동될 수 있음</li>
              </ul>
            </div>

            <div className="rounded-lg bg-ocean-light p-3">
              <p className="text-ocean">
                💡 <strong>팁:</strong> 통행 시간 30분 전에 도착하시면 여유롭게 
                건너실 수 있어요!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TideGuide;
