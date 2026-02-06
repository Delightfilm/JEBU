import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { UAParser } from "ua-parser-js";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "1234";

export type VisitorLog = {
  id: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  path: string | null;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** user_agent를 파싱해 기기 종류와 OS를 반환 (예외 시 "-" 반환) */
function parseUserAgent(ua: string | null): { deviceType: string; os: string } {
  if (!ua || !ua.trim()) return { deviceType: "-", os: "-" };
  try {
    const parser = new UAParser(ua);
    const result = parser.getResult();
    const rawType = result.device.type;
    const deviceType =
      rawType === "mobile"
        ? "Mobile"
        : rawType === "tablet"
          ? "Tablet"
          : rawType === "wearable"
            ? "Wearable"
            : rawType === "smarttv"
              ? "Smart TV"
              : "Desktop";
    const os = result.os.name ?? "-";
    return { deviceType, os };
  } catch {
    return { deviceType: "-", os: "-" };
  }
}

async function fetchVisitorLogs(): Promise<VisitorLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("visitor_logs")
    .select("id, created_at, ip_address, user_agent, path")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as VisitorLog[];
}

export default function AdminStats() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: logs = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["admin", "visitor_logs"],
    queryFn: fetchVisitorLogs,
    enabled: authenticated && !!supabase,
  });

  const dailyData = useMemo(() => {
    const byDate: Record<string, number> = {};
    logs.forEach((log) => {
      const date = new Date(log.created_at).toISOString().slice(0, 10);
      byDate[date] = (byDate[date] ?? 0) + 1;
    });
    return Object.entries(byDate)
      .map(([date, 방문자]) => ({ date, 방문자 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>관리자 인증</CardTitle>
            <CardDescription>방문자 통계를 보려면 비밀번호를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-password">비밀번호</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit">확인</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">방문자 통계</h1>
          <p className="text-muted-foreground">관리자 전용 방문 로그 및 일별 통계</p>
        </div>

        {dailyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>일별 방문자 수</CardTitle>
              <CardDescription>날짜별 방문 횟수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(v) => v}
                      formatter={(value: number) => [value, "방문자"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="방문자"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>방문 로그</CardTitle>
            <CardDescription>최신순 (최대 1,000건)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">불러오는 중...</p>}
            {fetchError && (
              <p className="text-destructive">
                로드 실패: {fetchError instanceof Error ? fetchError.message : String(fetchError)}
              </p>
            )}
            {!isLoading && !fetchError && logs.length === 0 && (
              <p className="text-muted-foreground">기록이 없습니다.</p>
            )}
            {!isLoading && !fetchError && logs.length > 0 && (
              <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">접속 시간</TableHead>
                      <TableHead className="whitespace-nowrap">IP</TableHead>
                      <TableHead className="whitespace-nowrap">기기</TableHead>
                      <TableHead className="whitespace-nowrap">OS</TableHead>
                      <TableHead className="whitespace-nowrap">경로</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((row) => {
                      const { deviceType, os } = parseUserAgent(row.user_agent);
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap font-mono text-xs">
                            {formatDateTime(row.created_at)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">
                            {row.ip_address ?? "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs" title={row.user_agent ?? ""}>
                            {deviceType}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs" title={row.user_agent ?? ""}>
                            {os}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {row.path ?? "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
