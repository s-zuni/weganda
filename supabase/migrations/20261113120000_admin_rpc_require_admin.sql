-- 관리자 전용 RPC 접근 통제 강화
--
-- 1) admin_get_dashboard_stats / get_admin_analytics: 함수 진입부에 관리자 검사(check_is_admin())를 추가한다.
--    다른 admin_* 함수(admin_get_users 등)와 같은 패턴이며, 함수 본문의 나머지는 기존 정의와 동일하다.
-- 2) admin_get_dashboard_stats: search_path 를 고정한다(SECURITY DEFINER 함수의 권장 설정).
-- 3) 위 두 함수와 admin_approve/reject_verification_request 의 EXECUTE 를 PUBLIC·anon 에서 회수한다.
--    admin_get_users 와 같이 authenticated + service_role 만 실행할 수 있다(관리자 여부는 함수 안에서 다시 검사).
--
-- 영향: 앱의 관리자 화면은 로그인한 관리자 세션으로 호출하므로 동작이 같다.
--       check_is_admin() 은 RLS 정책에서도 쓰이므로 이 마이그레이션에서 권한을 바꾸지 않는다.
-- 롤백: 이전 정의로 create or replace 후 `grant execute on function ... to anon;` 로 되돌린다.

create or replace function public.admin_get_dashboard_stats()
 returns json
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_today_start timestamptz := date_trunc('day', now() at time zone 'Asia/Seoul');
  v_total_users int;
  v_today_users int;
  v_total_posts int;
  v_pending_reports int;
  v_pending_verifications int;
  v_pending_inquiries int;
  v_recent_users json;
begin
  if not public.check_is_admin() then
    raise exception 'Access denied. Only administrators can perform this action.'
      using errcode = '42501';
  end if;

  -- 1. 유저 통계
  select count(*) into v_total_users from public.profiles;
  select count(*) into v_today_users from public.profiles where created_at >= v_today_start;

  -- 2. 게시글 통계
  select count(*) into v_total_posts from public.posts where is_hidden is not true;

  -- 3. 신고 대기 건수
  select count(*) into v_pending_reports from public.reports where status = 'pending';

  -- 4. 서류인증 대기 건수
  select count(*) into v_pending_verifications from public.verification_requests where status = 'pending';

  -- 5. 1:1 문의 대기 건수
  select count(*) into v_pending_inquiries from public.inquiries where status = 'pending';

  -- 6. 최근 가입 회원 5명
  select json_agg(u) into v_recent_users
  from (
    select id, name, email, role, is_active, created_at, hospital_name, ward_name
    from public.profiles
    order by created_at desc
    limit 5
  ) u;

  return json_build_object(
    'today_visitors', greatest(v_today_users * 3, 1),
    'total_users', v_total_users,
    'total_revenue', 0,
    'pending_reports', v_pending_reports,
    'pending_verifications', v_pending_verifications,
    'pending_inquiries', v_pending_inquiries,
    'today_users', v_today_users,
    'total_posts', v_total_posts,
    'recent_users', coalesce(v_recent_users, '[]'::json)
  );
end;
$function$;

create or replace function public.get_admin_analytics(
  p_start_date timestamp with time zone default (now() - '30 days'::interval),
  p_end_date timestamp with time zone default now()
)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public', 'auth'
as $function$
declare
    v_total_users bigint;
    v_total_schedules bigint;
    v_total_posts bigint;
    v_total_ai_chats bigint;
    v_total_friendships bigint;
    v_service_stats jsonb;
    v_daily_trends jsonb;
    v_total_activity bigint;
begin
    if not public.check_is_admin() then
      raise exception 'Access denied. Only administrators can perform this action.'
        using errcode = '42501';
    end if;

    select count(*) into v_total_users from public.profiles;
    select count(*) into v_total_schedules from public.schedules;
    select count(*) into v_total_posts from public.posts;
    select count(*) into v_total_ai_chats from public.ai_chat_history;
    select count(*) into v_total_friendships from public.friendships;

    v_total_activity := greatest(v_total_schedules + v_total_posts + v_total_ai_chats + v_total_friendships + 10, 1);

    -- 서비스별 점유율
    v_service_stats := jsonb_build_array(
        jsonb_build_object(
            'service_key', 'shift',
            'service_name', '3교대 듀티 캘린더',
            'total_duration', v_total_schedules * 180,
            'avg_duration', 215,
            'unique_users', v_total_users,
            'visit_count', greatest(v_total_schedules, 1),
            'duration_share', round((greatest(v_total_schedules, 1)::numeric / v_total_activity::numeric) * 100, 1)
        ),
        jsonb_build_object(
            'service_key', 'chat',
            'service_name', 'AI 임상/약물 챗봇',
            'total_duration', v_total_ai_chats * 150,
            'avg_duration', 180,
            'unique_users', v_total_users,
            'visit_count', v_total_ai_chats,
            'duration_share', round((greatest(v_total_ai_chats, 1)::numeric / v_total_activity::numeric) * 100, 1)
        ),
        jsonb_build_object(
            'service_key', 'community',
            'service_name', '간호사 커뮤니티',
            'total_duration', v_total_posts * 120,
            'avg_duration', 140,
            'unique_users', v_total_users,
            'visit_count', v_total_posts,
            'duration_share', round((greatest(v_total_posts, 1)::numeric / v_total_activity::numeric) * 100, 1)
        ),
        jsonb_build_object(
            'service_key', 'friends',
            'service_name', '동기 듀티 연동 & 오프 탐색',
            'total_duration', v_total_friendships * 90,
            'avg_duration', 110,
            'unique_users', v_total_users,
            'visit_count', v_total_friendships,
            'duration_share', round((greatest(v_total_friendships, 1)::numeric / v_total_activity::numeric) * 100, 1)
        ),
        jsonb_build_object(
            'service_key', 'fortune',
            'service_name', '오행·사주 듀티 운세',
            'total_duration', v_total_users * 100,
            'avg_duration', 160,
            'unique_users', v_total_users,
            'visit_count', v_total_users * 2,
            'duration_share', round((greatest(v_total_users, 1)::numeric / v_total_activity::numeric) * 100, 1)
        )
    );

    -- 일자별 신규 가입 및 활동 추이 (최근 7일)
    select coalesce(jsonb_agg(d_row), '[]'::jsonb) into v_daily_trends
    from (
        select
            to_char(d.day, 'YYYY-MM-DD') as date,
            count(p.id) as unique_users,
            count(p.id) as session_count,
            count(p.id) * 300 as total_duration,
            300 as avg_duration
        from generate_series(current_date - interval '6 days', current_date, '1 day'::interval) d(day)
        left join public.profiles p on date_trunc('day', p.created_at) = d.day
        group by d.day
        order by d.day asc
    ) d_row;

    return jsonb_build_object(
        'overview', jsonb_build_object(
            'total_duration_seconds', v_total_activity * 200,
            'avg_duration_seconds', 210,
            'total_sessions', v_total_activity,
            'unique_users', v_total_users,
            'active_now', greatest(v_total_users, 1),
            'retention_rate', 85.0
        ),
        'service_stats', v_service_stats,
        'daily_trends', v_daily_trends,
        'device_stats', jsonb_build_array(
            jsonb_build_object('device_type', 'mobile_ios', 'session_count', 4, 'unique_users', v_total_users, 'total_duration', 1200),
            jsonb_build_object('device_type', 'desktop_web', 'session_count', 2, 'unique_users', v_total_users, 'total_duration', 600)
        )
    );
end;
$function$;

-- EXECUTE 권한: PUBLIC·anon 회수, authenticated·service_role 유지(관리자 검사는 함수 안에서 수행)
revoke execute on function public.admin_get_dashboard_stats() from public, anon;
revoke execute on function public.get_admin_analytics(timestamp with time zone, timestamp with time zone) from public, anon;
revoke execute on function public.admin_approve_verification_request(uuid, text) from public, anon;
revoke execute on function public.admin_reject_verification_request(uuid, text) from public, anon;

grant execute on function public.admin_get_dashboard_stats() to authenticated, service_role;
grant execute on function public.get_admin_analytics(timestamp with time zone, timestamp with time zone) to authenticated, service_role;
grant execute on function public.admin_approve_verification_request(uuid, text) to authenticated, service_role;
grant execute on function public.admin_reject_verification_request(uuid, text) to authenticated, service_role;
