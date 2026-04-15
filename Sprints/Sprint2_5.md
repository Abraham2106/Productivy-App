# Architecture Prompt - Sprint 2.5: Usuarios y Login
## Productivity App - Personal Habit Tracker

---

## Prerequisito

Sprint 2 completado. Las siguientes piezas deben existir y estar funcionando antes de empezar:
- `TaskService`, `MetricsService` y `AnalyticsService`
- Repositorios Supabase para `tasks`, `daily_scores`, `habit_patterns`
- Frontend conectado a Supabase via `@supabase/supabase-js`
- Tabla `public.users` creada y usada como perfil de aplicacion

Si alguno de estos puntos no existe, detente y completa primero S1 y S2.

---

## Objetivo del Sprint

Pasar de una aplicacion con usuario local fijo a una aplicacion multiusuario basica con autenticacion real. Al final del sprint el usuario puede:
1. Crear una cuenta con `email`, `password` y `name`
2. Iniciar sesion con email y password
3. Cerrar sesion desde la app
4. Mantener la sesion al recargar la pagina
5. Leer y escribir sus propios datos usando su `user.id` autenticado

Escala objetivo del sprint: `1 a 10 usuarios`, con diseno modular para crecer despues.

---

## Decisiones Arquitectonicas del Sprint 2.5

- La autenticacion se resuelve con `Supabase Auth`, no con FastAPI.
- El metodo de acceso es `email/password`.
- La UX de entrada sera una `pantalla dedicada de autenticacion`, no modal.
- La tabla `public.users` sigue existiendo como perfil de aplicacion.
- `auth.users` es la fuente primaria de identidad.
- `public.users.id` debe ser exactamente el mismo UUID que `auth.users.id`.
- El frontend deja de usar `DEFAULT_USER_ID` y pasa a usar el `user.id` autenticado.
- En este sprint el backend conserva sus endpoints actuales con `user_id` explicito.
- La validacion de JWT de Supabase en FastAPI queda para el siguiente sprint.

### Alcance incluido
- Registro
- Login
- Logout
- Sesion persistente basica
- Rutas y vistas protegidas del lado frontend
- RLS minimo en Supabase

### Fuera de alcance
- Social login
- Magic links
- Recuperacion de password
- MFA
- Perfil editable avanzado
- Autenticacion propia en FastAPI
- Derivar identidad desde bearer token en backend

---

## Configuracion en Supabase Auth

Antes de implementar el frontend, habilitar en el dashboard de Supabase:
- Provider `Email`
- Signups permitidos
- Confirmacion por email opcional segun el entorno

Default elegido para este sprint:
- En desarrollo se puede desactivar email confirmation para acelerar pruebas
- En produccion se recomienda activarla, pero no forma parte de este sprint

---

## Migraciones SQL (Supabase)

La meta es alinear `auth.users` con `public.users` y proteger tablas con RLS.

### 1. Ajuste de `public.users`

Si `public.users` ya existe, extenderla sin romper datos previos:

```sql
create extension if not exists pgcrypto;

alter table public.users
  add column if not exists email text;

create unique index if not exists idx_users_email_unique
  on public.users (email);
```

La tabla `public.users` debe quedar con este contrato:
- `id UUID primary key` igual a `auth.users.id`
- `email TEXT unique`
- `name TEXT not null`
- `created_at TIMESTAMPTZ default now()`

### 2. Bootstrap automatico desde `auth.users`

Cada `signUp` en Supabase debe crear automaticamente el perfil en `public.users`.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_name text;
begin
  fallback_name := split_part(new.email, '@', 1);

  insert into public.users (id, email, name, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', fallback_name),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(public.users.name, excluded.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

### 3. Sincronizacion de usuarios existentes

Si ya hay usuarios en `auth.users` pero no en `public.users`, correr una sola vez:

```sql
insert into public.users (id, email, name, created_at)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  now()
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null;
```

### 4. Activar RLS

```sql
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_scores enable row level security;
alter table public.score_details enable row level security;
alter table public.habit_patterns enable row level security;
```

### 5. Politicas RLS

Cada usuario autenticado solo puede leer y escribir sus propios registros.

```sql
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "daily_scores_select_own" on public.daily_scores;
create policy "daily_scores_select_own"
on public.daily_scores
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "daily_scores_insert_own" on public.daily_scores;
create policy "daily_scores_insert_own"
on public.daily_scores
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "daily_scores_update_own" on public.daily_scores;
create policy "daily_scores_update_own"
on public.daily_scores
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "habit_patterns_select_own" on public.habit_patterns;
create policy "habit_patterns_select_own"
on public.habit_patterns
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "habit_patterns_insert_own" on public.habit_patterns;
create policy "habit_patterns_insert_own"
on public.habit_patterns
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "habit_patterns_update_own" on public.habit_patterns;
create policy "habit_patterns_update_own"
on public.habit_patterns
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### 6. Politicas para `score_details`

`score_details` no tiene `user_id`, asi que debe restringirse por pertenencia al `daily_score` o la `task`.

```sql
drop policy if exists "score_details_select_own" on public.score_details;
create policy "score_details_select_own"
on public.score_details
for select
to authenticated
using (
  exists (
    select 1
    from public.daily_scores ds
    where ds.id = score_details.daily_score_id
      and ds.user_id = auth.uid()
  )
);

drop policy if exists "score_details_insert_own" on public.score_details;
create policy "score_details_insert_own"
on public.score_details
for insert
to authenticated
with check (
  exists (
    select 1
    from public.daily_scores ds
    where ds.id = score_details.daily_score_id
      and ds.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tasks t
    where t.id = score_details.task_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "score_details_delete_own" on public.score_details;
create policy "score_details_delete_own"
on public.score_details
for delete
to authenticated
using (
  exists (
    select 1
    from public.daily_scores ds
    where ds.id = score_details.daily_score_id
      and ds.user_id = auth.uid()
  )
);
```

---

## Cambios de Frontend

El frontend pasa de usuario local fijo a usuario autenticado.

### Nueva pantalla de autenticacion

Crear una vista dedicada, por ejemplo:

```
/src
  /features
    /auth
      AuthScreen.tsx
      LoginForm.tsx
      SignUpForm.tsx
      useAuth.ts
      AuthProvider.tsx
```

La pantalla debe tener dos modos:
- `Login`
- `Sign up`

Campos requeridos:

**Login**
- `email`
- `password`

**Sign up**
- `name`
- `email`
- `password`

### Integracion con Supabase Auth

Usar estas llamadas:

```ts
supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name },
  },
});

supabase.auth.signInWithPassword({
  email,
  password,
});

supabase.auth.signOut();
```

### Fuente unica de sesion

Crear un `AuthProvider` o `useAuth` como unica fuente de verdad.

Contrato recomendado:

```ts
export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}
```

API minima esperada:

```ts
interface AuthContextValue extends AuthState {
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### Persistencia de sesion

`AuthProvider` debe:
- llamar `supabase.auth.getSession()` al montar
- suscribirse a `supabase.auth.onAuthStateChange`
- mantener `loading=true` hasta resolver la sesion inicial

### Gate de aplicacion

`App.tsx` deja de renderizar libremente.

Regla:
- `loading=true` -> mostrar loader o splash simple
- `user=null` -> mostrar `AuthScreen`
- `user!=null` -> mostrar la app actual

### Cambio clave en `useTasks`

Eliminar dependencia de `DEFAULT_USER_ID`.

Contrato recomendado:

```ts
function useTasks(userId: string | null) { ... }
```

Comportamiento esperado:
- si `userId` es `null`, no leer ni escribir datos
- si `userId` existe, usarlo para todas las operaciones
- mantener compatibilidad con la UI actual

### Resto del frontend

Mantener sin rediseño grande:
- `DailyView`
- `WeeklyView`
- `Sidebar`
- `MobileHeader`

Solo agregar:
- boton de logout visible
- nombre o email del usuario autenticado en header o sidebar

---

## Backend y Arquitectura

En Sprint 2.5 no se implementa login en FastAPI.

### Regla innegociable

FastAPI sigue manejando dominio y datos, pero no credenciales.

### Estado del backend en este sprint

- `users` sigue siendo perfil de aplicacion
- `TaskService`, `MetricsService` y `AnalyticsService` siguen recibiendo `user_id`
- No se agrega endpoint `/login` ni `/register`
- No se valida bearer token aun
- No se reemplazan los contratos de dominio actuales

### Evolucion esperada para Sprint 3

El siguiente sprint de seguridad debe:
- validar JWT de Supabase en FastAPI
- dejar de aceptar `user_id` libre en query o body donde aplique
- derivar la identidad desde el token autenticado
- endurecer los routers para que trabajen con el usuario autenticado

---

## Flujo de Autenticacion

### Registro

1. Usuario abre `AuthScreen` en modo `Sign up`
2. Ingresa `name`, `email`, `password`
3. Frontend llama `supabase.auth.signUp`
4. Supabase crea fila en `auth.users`
5. Trigger crea fila en `public.users`
6. `AuthProvider` recibe cambio de sesion
7. La app renderiza la UI principal usando `user.id`

### Login

1. Usuario abre `AuthScreen` en modo `Login`
2. Ingresa `email` y `password`
3. Frontend llama `signInWithPassword`
4. Supabase devuelve sesion
5. `AuthProvider` actualiza `session` y `user`
6. `App.tsx` muestra la aplicacion

### Logout

1. Usuario hace click en `Logout`
2. Frontend llama `supabase.auth.signOut`
3. `AuthProvider` limpia la sesion
4. `App.tsx` vuelve a `AuthScreen`

---

## Cambios en Archivos Existentes

### `frontend/src/App.tsx`

- Envolver contenido con gate de autenticacion
- Remover cualquier dependencia de usuario fijo
- Mostrar `AuthScreen` cuando no exista sesion

### `frontend/src/hooks/useTasks.ts`

- Eliminar `DEFAULT_USER_ID`
- Recibir `userId` dinamico
- Mantener firmas existentes de tareas y metricas donde sea posible

### `frontend/src/utils/supabase.ts`

- Reutilizar el cliente existente para `auth` y `db`
- No crear clientes duplicados

No introducir auth en backend fuera de futuras extensiones.

---

## Tests Requeridos (Sprint 2.5)

### Frontend

- Registro exitoso con `name`, `email`, `password`
- Registro fallido con email duplicado
- Login exitoso con credenciales validas
- Login fallido con credenciales invalidas
- Sesion persistente al recargar
- Logout exitoso y retorno a `AuthScreen`
- `App.tsx` no renderiza la app si `user` es `null`
- `useTasks` usa el `user.id` autenticado y no un id fijo

### Supabase / Seguridad

- Tras `signUp`, existe fila en `public.users`
- Usuario A no puede leer `tasks` de Usuario B
- Usuario A no puede insertar `tasks` con `user_id` de Usuario B
- Usuario A no puede leer `daily_scores` ni `habit_patterns` de Usuario B
- Usuario A no puede leer `score_details` de otro usuario

### Backend

- Los servicios existentes siguen funcionando con `user_id` valido
- No se agregan imports de SDK fuera de infraestructura
- No se introduce logica de auth dentro del dominio

---

## Checklist de Validacion antes de PR

- [ ] `public.users.id` coincide con `auth.users.id`
- [ ] `public.users` tiene columna `email` unica
- [ ] Trigger `handle_new_user()` crea perfil automaticamente
- [ ] RLS esta habilitado en todas las tablas de datos
- [ ] Politicas permiten acceso solo al usuario dueno del registro
- [ ] Frontend muestra `AuthScreen` sin sesion
- [ ] Frontend mantiene sesion al recargar
- [ ] `useTasks` ya no usa `DEFAULT_USER_ID`
- [ ] El usuario autenticado puede crear y leer sus propios datos
- [ ] El usuario autenticado no puede leer datos de otro usuario

---

## Lo que NO implementar en Sprint 2.5

- Login con Google, GitHub o Apple
- Magic links
- Reset de password
- MFA
- Perfil editable completo
- Guard de permisos por roles
- JWT validation en FastAPI
- Remocion total de `user_id` desde los endpoints actuales
- Multi-tenant o equipos

---

## Resultado Esperado del Sprint

Al cerrar Sprint 2.5, la aplicacion deja de depender de un usuario local hardcodeado y pasa a operar con identidad real via Supabase Auth. El sistema queda listo para distinguir usuarios de forma correcta, proteger datos con RLS y preparar un siguiente sprint donde FastAPI consuma la identidad desde JWT en lugar de recibir `user_id` libre.
