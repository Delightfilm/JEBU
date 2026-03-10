import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Stats", charset="UTF-8"',
    },
  });
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_BASIC_AUTH_USER ?? "";
  const pass = process.env.ADMIN_BASIC_AUTH_PASS ?? "";

  // 환경변수가 없으면 안전을 위해 무조건 차단
  if (!user || !pass) return unauthorized();

  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader?.startsWith("Basic ")) return unauthorized();

  try {
    const base64 = authHeader.slice("Basic ".length).trim();
    const decoded = atob(base64);
    const idx = decoded.indexOf(":");
    const u = idx >= 0 ? decoded.slice(0, idx) : "";
    const p = idx >= 0 ? decoded.slice(idx + 1) : "";
    if (safeEqual(u, user) && safeEqual(p, pass)) return NextResponse.next();
    return unauthorized();
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/admin-stats/:path*"],
};

