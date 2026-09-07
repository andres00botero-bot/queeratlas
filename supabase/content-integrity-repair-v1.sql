-- Focused repair for verified production mojibake and one broken sentence join.
-- Safe to re-run: every replacement is idempotent and scoped to a known row.

begin;

update public.places
set description = replace(description, 'event.is', 'event. It is')
where id = 2
  and description like '%event.is%';

update public.places
set description = replace(description, 'â€™', '’')
where id in (3309, 3310)
  and description like '%â€™%';

update public.places
set
  name = replace(replace(name, 'CabarÃ©tito', 'Cabarétito'), 'FusiÃ³n', 'Fusión'),
  description = replace(
    replace(description, 'CabarÃ©tito', 'Cabarétito'),
    'FusiÃ³n',
    'Fusión'
  )
where id = 1685;

update public.places
set
  name = replace(name, 'BÃ¤renhÃ¶hle', 'Bärenhöhle'),
  description = replace(description, 'BÃ¤renhÃ¶hle', 'Bärenhöhle')
where id = 3320;

update public.places
set
  name = replace(name, 'MÃ¤nnerzone', 'Männerzone'),
  description = replace(description, 'MÃ¤nnerzone', 'Männerzone')
where id = 3330;

update public.places
set name = replace(name, 'HabrolÃ³', 'Habroló')
where id = 3337;

update public.places
set
  name = replace(name, 'CafÃ©', 'Café'),
  description = replace(description, 'cafÃ©', 'café')
where id = 3338;

update public.places
set name = replace(name, 'RVT â€“ Royal Vauxhall Tavern', 'RVT – Royal Vauxhall Tavern')
where id = 3359;

commit;

