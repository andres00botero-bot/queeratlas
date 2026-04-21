-- Queer Atlas: live-vibe cleanup/retention job
-- Safe to run multiple times.
-- Keeps table slim by deleting old rows.

begin;

create or replace function public.qa_cleanup_place_vibe_signals()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  delete from public.qa_place_vibe_signals
  where created_at < now() - interval '30 days';

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

grant execute on function public.qa_cleanup_place_vibe_signals() to authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('qa_cleanup_place_vibe_signals_daily');
    perform cron.schedule(
      'qa_cleanup_place_vibe_signals_daily',
      '17 3 * * *',
      $$select public.qa_cleanup_place_vibe_signals();$$
    );
  end if;
end;
$$;

commit;
