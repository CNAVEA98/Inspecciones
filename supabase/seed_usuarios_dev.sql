-- ---------- Usuarios de desarrollo (solo local) ----------
-- Se entra con el usuario (TECNICO_A, SUPERVISOR_B…); el correo @mlp.local es interno y no se muestra.
-- El trigger de alta crea los perfiles como 'technician'; rol y turno se asignan aquí por SQL.
do $$
declare
  u record;
  v_id uuid;
begin
  for u in
    select * from (values
      ('administrador@mlp.local', 'CLAVE-ELIMINADA', 'Administrador', 'admin', null),
      ('supervisor_a@mlp.local', 'CLAVE-ELIMINADA', 'Supervisor A', 'supervisor', 'A'),
      ('supervisor_b@mlp.local', 'CLAVE-ELIMINADA', 'Supervisor B', 'supervisor', 'B'),
      ('programador_a@mlp.local', 'CLAVE-ELIMINADA', 'Programador A', 'planner', 'A'),
      ('programador_b@mlp.local', 'CLAVE-ELIMINADA', 'Programador B', 'planner', 'B'),
      ('tecnico_a@mlp.local', 'CLAVE-ELIMINADA', 'Técnico A', 'technician', 'A'),
      ('tecnico_b@mlp.local', 'CLAVE-ELIMINADA', 'Técnico B', 'technician', 'B')
    ) as t(email, pass, full_name, role, shift)
  loop
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      email_change_token_current, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      u.email, extensions.crypt(u.pass, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', u.full_name),
      now(), now(), '', '', '', '', '', ''
    );
    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_id::text, v_id,
            jsonb_build_object('sub', v_id::text, 'email', u.email, 'email_verified', true),
            'email', now(), now(), now());
    update public.profiles set role = u.role, shift = u.shift where id = v_id;
  end loop;
end $$;
