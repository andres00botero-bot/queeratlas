begin;

update public.places
set
  description = 'Set directly on Oranienplatz in Kreuzberg, Orania.Berlin is a luxury boutique hotel built around a lively salon, restaurant, bar and concert programme. It is not a queer-only property, but its central Kreuzberg setting makes it a polished base for travelers who want culture and nightlife within easy reach rather than a resort-style stay.',
  location = 'Oranienplatz 17, 10999 Berlin, Germany',
  link = 'https://orania.berlin/'
where id = 47
  and lower(trim(name)) = 'hotel orania berlin'
  and lower(trim(city)) = 'berlin';

commit;

select id, name, city, description, location, link
from public.places
where id = 47;
