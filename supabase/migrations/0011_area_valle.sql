-- Quinta área del flujo de inspección: Valle (red comercial CGE, Booster, Monte Aranda, Km 80, GG Valle).
-- Solo agrega una fila al catálogo; si el área ya existe (p. ej. por el seed) no hace nada.
insert into public.areas (code, name, sort)
values ('valle', 'Valle', 5)
on conflict (code) do nothing;
