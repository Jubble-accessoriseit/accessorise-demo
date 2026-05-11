-- Add Royal Enfield Himalayan 450 Hanle Black Tubeless 2026
insert into public.bikes (id, make, model, variant, year, category, engine_cc)
values (
  'royal-enfield-2026-himalayan-450-hanle-black-tubeless',
  'Royal Enfield',
  'Himalayan 450',
  'Hanle Black Tubeless',
  2026,
  'Adventure',
  452
)
on conflict (id) do nothing;
