-- App Store Guideline 1.2 대응: 만 18세 이상 확인(age18) 및 커뮤니티 이용약관(community) 동의 이력 기록 허용
alter table public.consent_logs drop constraint if exists consent_logs_consent_type_check;
alter table public.consent_logs add constraint consent_logs_consent_type_check
  check (consent_type = any (array['age14','age18','terms','privacy','membership','marketing','community']::text[]));
