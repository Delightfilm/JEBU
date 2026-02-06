# Supabase 방문자 수 설정 가이드

## 1. 테이블 구조

Supabase 대시보드 → **SQL Editor**에서 아래 SQL을 순서대로 실행하세요.

### 1) 방문자 집계 테이블 생성

```sql
-- 방문자 수 집계용 테이블
-- key: 'total' = 전체 누적, 'YYYY-MM-DD' = 해당 일자 방문 수
create table if not exists public.visitor_counts (
  key text primary key,
  count bigint not null default 0
);

-- RLS 활성화
alter table public.visitor_counts enable row level security;

-- anon/authenticated 사용자는 이 테이블 직접 접근 불가 (RPC로만 갱신)
-- 정책 없음 = 아무도 select/insert/update 불가
-- increment_visitor() 함수만 security definer로 테이블 갱신
```

### 2) 방문자 증가 + 조회 함수 (한국 시간 기준 오늘 키 사용)

```sql
-- 페이지 로드 시 1회 호출: 오늘/전체 카운트 +1 후 최신 값 반환
create or replace function public.increment_visitor()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  today_key text;
  res json;
begin
  -- 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
  today_key := to_char((now() at time zone 'Asia/Seoul')::date, 'YYYY-MM-DD');

  -- 오늘 방문 수 +1 (upsert)
  insert into public.visitor_counts (key, count)
  values (today_key, 1)
  on conflict (key) do update set count = visitor_counts.count + 1;

  -- 전체 방문 수 +1 (upsert)
  insert into public.visitor_counts (key, count)
  values ('total', 1)
  on conflict (key) do update set count = visitor_counts.count + 1;

  -- 방금 반영된 오늘/전체 값 반환
  select json_build_object(
    'today', (select count from public.visitor_counts where key = today_key),
    'total', (select count from public.visitor_counts where key = 'total')
  ) into res;
  return res;
end;
$$;

-- anon(비로그인) 사용자도 이 함수만 실행 가능하도록 권한 부여
grant execute on function public.increment_visitor() to anon;
grant execute on function public.increment_visitor() to authenticated;
```

### 3) (선택) 초기값 넣기

전체를 0이 아닌 값으로 시작하려면:

```sql
insert into public.visitor_counts (key, count) values ('total', 0)
on conflict (key) do nothing;
```

- `increment_visitor()`를 한 번 호출하면 `total`과 오늘 날짜 키가 1부터 시작합니다.
- 별도 초기값 없이 두고, 첫 방문부터 1로 쌓아도 됩니다.

## 2. 환경 변수

프로젝트 루트에 `.env` 또는 `.env.local` 파일을 만들고 다음을 넣으세요.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- **Supabase URL / anon key**: 대시보드 → **Project Settings** → **API**에서 확인합니다.
- `VITE_` 접두사는 Vite에서 클라이언트 번들에 노출하기 위해 필요합니다.

## 3. 동작 요약

| 항목 | 설명 |
|------|------|
| **전체** | 모든 사용자의 방문이 `visitor_counts.key = 'total'` 에 누적됩니다. |
| **오늘** | 한국 시간(Asia/Seoul) 기준 당일 방문만 `key = 'YYYY-MM-DD'` 행에 누적됩니다. |
| **호출** | 프론트에서 페이지 로드 시 `increment_visitor()` RPC를 1회 호출해, 동시에 +1 반영 후 최신 `today`/`total`을 받아 표시합니다. |
