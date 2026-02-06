import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type VisitorCounts = { today: number; total: number };

/** 방문자 수 +1 후 최신 오늘/전체 카운트 반환. Supabase 미설정 시 null */
export async function incrementVisitor(
  user_ip: string,
  user_info: string,
  page_path: string
): Promise<VisitorCounts | null> {
  if (!supabase) return null;
  const payload = { user_ip, user_info, page_path };
  const hasEmpty =
    payload.user_ip === "" ||
    payload.user_info === "" ||
    payload.page_path === "";
  console.log("[VisitorCounter] increment_visitor payload:", payload, hasEmpty ? "(일부 비어 있음)" : "(값 있음)");
  const { data, error } = await supabase.rpc("increment_visitor", payload);
  if (error) {
    console.warn("[VisitorCounter] increment_visitor error:", error.message);
    return null;
  }
  if (data && typeof data.today === "number" && typeof data.total === "number") {
    return { today: data.today, total: data.total };
  }
  return null;
}
