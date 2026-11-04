# Auditoria de Logs — SISCAD AAFC

Documentação técnica do mecanismo de auditoria (trilha de mudanças) do SISCAD.

| | |
|---|---|
| **Projeto** | SISCAD AAFC — Sistema de Cadastro de Sócios |
| **Stack** | React 19 + TypeScript + Vite (front) · Supabase / PostgreSQL + PostgREST (back) |
| **Escopo** | Gravação, leitura, filtros, permissões e riscos do subsistema de auditoria |
| **Arquivo principal (SQL)** | [`dev/sql/audit_triggers.sql`](../dev/sql/audit_triggers.sql) |
| **Última revisão** | 2026-10-21 |

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Arquitetura do fluxo](#2-arquitetura-do-fluxo)
3. [Camada de banco de dados](#3-camada-de-banco-de-dados)
4. [Camada de aplicação (front-end)](#4-camada-de-aplicação-front-end)
5. [Fluxo detalhado de gravação](#5-fluxo-detalhado-de-gravação)
6. [Fluxo detalhado de leitura](#6-fluxo-detalhado-de-leitura)
7. [Permissões e controle de acesso](#7-permissões-e-controle-de-acesso)
8. [Referência de arquivos](#8-referência-de-arquivos)
9. [Deploy e manutenção](#9-deploy-e-manutenção)
10. [Riscos, limitações e recomendações](#10-riscos-limitações-e-recomendações)
11. [Glossário](#11-glossário)

---

## 1. Visão geral

O SISCAD não possui backend próprio (Node/Java/PHP). Toda a camada de dados é o
**Supabase** (PostgreSQL + PostgREST + Supabase Auth + RLS), acessado
diretamente do navegador via `@supabase/supabase-js` e `axios`.

Consequência importante: **a auditoria não é implementada no front-end**. Ela é
implementada inteiramente no PostgreSQL, por meio de *triggers* `AFTER ... FOR
EACH ROW`. Isso tem duas consequências práticas:

- **A autoria é confiável.** O usuário do log é extraído do token JWT dentro do
  próprio Postgres (`request.jwt.claims->>'sub'`). O front-end não tem como
  declarar "eu fiz isso" — o valor é preenchido pelo servidor de banco.
- **Qualquer escrita feita fora da aplicação também é auditada.** Se alguém
  escrever direto na tabela pelo SQL Editor, Postgres ou uma API externa que
  use o mesmo banco, o log é gerado da mesma forma.

### O que é auditado

Nove tabelas do sistema possuem trigger de auditoria:

| Tabela | Rótulo na tela | Operações auditadas |
|---|---|---|
| `members` | Sócios | INSERT, UPDATE, DELETE |
| `meetings` | Reuniões | INSERT, UPDATE, DELETE |
| `meetings_members` | Reuniões x Sócios | INSERT, UPDATE, DELETE |
| `users` | Usuários | INSERT, UPDATE, DELETE |
| `profiles` | Perfis | INSERT, UPDATE, DELETE |
| `permissions` | Permissões | INSERT, UPDATE, DELETE |
| `plans` | Planos | INSERT, UPDATE, DELETE |
| `regions` | Regiões | INSERT, UPDATE, DELETE |
| `genders` | Gêneros | INSERT, UPDATE, DELETE |

---

## 2. Arquitetura do fluxo

```
┌──────────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR (React + TypeScript)                                         │
│                                                                          │
│  Página LogsSearch  ──►  useLogStore (Zustand)  ──►  logsApi            │
│  (src/pages/logs/)         (src/store/)              (src/api/logs.ts)  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │ axios + interceptor
                                               │ (JWT do Supabase Auth)
                                               │ (snake_case → camelCase)
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  SUPABASE / POSTGREST  —  https://<ref>.supabase.co/rest/v1             │
│                                                                          │
│  Leitura:  GET /v_audit_logs?...                                         │
│            └─► view v_audit_logs  ──►  LEFT JOIN users (nome, e-mail)   │
│                                                                          │
│  Escrita (mutações de negócio):                                         │
│    POST/PATCH/DELETE /members, /meetings, /users, /profiles...          │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  POSTGRESQL                                                              │
│                                                                          │
│  trigger AFTER INSERT/UPDATE/DELETE FOR EACH ROW                         │
│        └─► fn_audit()  [SECURITY DEFINER]                                │
│                 ├─ lê author do JWT (request.jwt.claims->>'sub')          │
│                 ├─ resolve users.id a partir de users.uuid                │
│                 └─ INSERT em public.audit_logs                           │
│                          (table_name, operation, data_old, data_new)     │
│                                                                          │
│  RLS em audit_logs: SELECT só para is_admin_super; escrita bloqueada    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Camada de banco de dados

### 3.1 Tabela `public.audit_logs`

Definida em `dev/sql/audit_triggers.sql` (L10–20):

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_date  TIMESTAMP WITHOUT TIME ZONE NOT NULL
                DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'),
  user_uuid     UUID NULL,
  table_name    TEXT NULL,
  operation     TEXT NULL,
  data_old      JSONB NULL,
  data_new      JSONB NULL,
  user_id       BIGINT NULL,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
```

| Coluna | Tipo | Origem | Descrição |
|---|---|---|---|
| `id` | `BIGINT IDENTITY` | sequence | PK do registro de auditoria |
| `created_date` | `TIMESTAMP` | `NOW() AT TIME ZONE 'America/Sao_Paulo'` | Momento da operação (hora local "crua", sem TZ) |
| `user_uuid` | `UUID` | `request.jwt.claims->>'sub'` | UUID do usuário Supabase Auth autor da operação (`NULL` sem JWT) |
| `table_name` | `TEXT` | `TG_TABLE_NAME` | Tabela afetada |
| `operation` | `TEXT` | `TG_OP` | `INSERT`, `UPDATE` ou `DELETE` |
| `data_old` | `JSONB` | `TO_JSONB(OLD)` | Snapshot completo da linha **antes** (`NULL` em INSERT) |
| `data_new` | `JSONB` | `TO_JSONB(NEW)` | Snapshot completo da linha **depois** (`NULL` em DELETE) |
| `user_id` | `BIGINT` | `SELECT id FROM users WHERE uuid = ...` | ID numérico do autor em `public.users` |

Índices (L22–26): `created_date DESC`, `table_name`, `operation`, `user_uuid`, `user_id`.

> **Nota sobre snapshots:** o log guarda a **linha inteira**, não um diff coluna a
> coluna. A comparação "antes × depois" é feita exclusivamente na interface.

### 3.2 Função `fn_audit()` — o motor da auditoria

`dev/sql/audit_triggers.sql` (L41–86):

```sql
CREATE OR REPLACE FUNCTION public.fn_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uuid UUID;
  v_user_id   BIGINT;
BEGIN
  -- Extrair UUID do usuário a partir do JWT (Supabase Auth)
  BEGIN
    v_user_uuid := (CURRENT_SETTING('request.jwt.claims')::JSON)->>'sub';
  EXCEPTION WHEN OTHERS THEN
    v_user_uuid := NULL;
  END;

  IF v_user_uuid IS NOT NULL THEN
    SELECT id INTO v_user_id FROM public.users
    WHERE uuid = v_user_uuid::TEXT LIMIT 1;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_uuid, table_name, operation, data_old, data_new, user_id)
    VALUES (v_user_uuid, TG_TABLE_NAME, 'INSERT', NULL, TO_JSONB(NEW), v_user_id);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Só insere log se os dados realmente mudaram
    IF TO_JSONB(OLD) IS DISTINCT FROM TO_JSONB(NEW) THEN
      INSERT INTO public.audit_logs (user_uuid, table_name, operation, data_old, data_new, user_id)
      VALUES (v_user_uuid, TG_TABLE_NAME, 'UPDATE', TO_JSONB(OLD), TO_JSONB(NEW), v_user_id);
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_uuid, table_name, operation, data_old, data_new, user_id)
    VALUES (v_user_uuid, TG_TABLE_NAME, 'DELETE', TO_JSONB(OLD), NULL, v_user_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;
```

Pontos de projeto:

| Aspecto | Comportamento |
|---|---|
| **Autoria** | Extraída do JWT no servidor. Não é falsificável pelo cliente. |
| **`SECURITY DEFINER`** | Permite gravar em `audit_logs` apesar da RLS de escrita bloquear inserts diretos. |
| **Ruído em UPDATE** | Só grava quando a linha realmente mudou (`IS DISTINCT FROM`). |
| **Operações sem JWT** | `user_uuid` e `user_id` ficam `NULL`; a tela exibe o autor como `Sistema`. |
| **Falha de auditoria** | O `INSERT` no log é parte da mesma transação da mutação — se o log falhar, a mutação é revertida. |

### 3.3 Triggers

`dev/sql/audit_triggers.sql` (L93–145). Padrão repetido para cada tabela:

```sql
DROP TRIGGER IF EXISTS audit_members ON public.members;
CREATE TRIGGER audit_members
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
```

O uso de `DROP TRIGGER IF EXISTS` + `CREATE` torna o script **idempotente**:
pode ser reaplicado com segurança no Supabase SQL Editor.

### 3.4 Row Level Security (RLS)

`dev/sql/audit_triggers.sql` (L149–172):

```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Leitura: apenas super-admins
CREATE POLICY "audit_logs: leitura apenas super admin"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.uuid = (CURRENT_SETTING('request.jwt.claims')::JSON)->>'sub'::TEXT
        AND u.is_admin_super = TRUE
    )
  );

-- Bloquear inserts/updates/deletes diretos via API
CREATE POLICY "audit_logs: sem escrita direta"
  ON public.audit_logs FOR ALL TO authenticated
  USING (FALSE) WITH CHECK (FALSE);
```

- **Leitura:** permitida apenas para usuários com `users.is_admin_super = TRUE`.
- **Escrita:** proibida para todos via API (`USING (FALSE)`). Apenas o trigger
  `SECURITY DEFINER` consegue inserir — a trilha é **append-only** para a aplicação.

### 3.5 View `v_audit_logs`

`dev/sql/audit_triggers.sql` (L178–194):

```sql
CREATE OR REPLACE VIEW public.v_audit_logs AS
SELECT
  l.id, l.created_date, l.user_uuid,
  u.name_full AS user_name,
  u.email     AS user_email,
  l.table_name, l.operation, l.data_old, l.data_new, l.user_id
FROM public.audit_logs l
LEFT JOIN public.users u ON u.uuid = l.user_uuid::TEXT
ORDER BY l.created_date DESC;
```

O `LEFT JOIN` com `users` é o que permite exibir o nome e o e-mail do autor
na lista. O `ORDER BY` interno é redundante (o PostgREST aplica
`order=created_date.desc` explicitamente) e é normalmente ignorado pelo
planejador em consultas externas.

---

## 4. Camada de aplicação (front-end)

### 4.1 Modelo — `src/models/log.ts`

```ts
export interface ILog {
  id: number;
  createdDate: string;
  userUuid: string | null;
  userName: string | null;
  userEmail: string | null;
  tableName: string | null;
  operation: string | null;
  dataOld: Record<string, unknown> | null;
  dataNew: Record<string, unknown> | null;
  userId: number | null;
}

export interface ILogFilters {
  tableName: string;
  operation: string;
  userSearch: string;
  startDate: string;
  endDate: string;
}
```

Rótulos e cores apresentados na interface:

```ts
export const TABLE_LABELS: Record<string, string> = {
  members: 'Socios', meetings: 'Reunioes', meetings_members: 'Reunioes x Socios',
  users: 'Usuarios', profiles: 'Perfis', permissions: 'Permissoes',
  plans: 'Planos', regions: 'Regioes', genders: 'Generos',
};

export const OPERATION_LABELS: Record<string, string> = {
  INSERT: 'Inserido', UPDATE: 'Alterado', DELETE: 'Excluido',
};

export const OPERATION_COLORS: Record<string, { bg: string; color: string }> = {
  INSERT: { bg: '#dcfce7', color: '#16a34a' },
  UPDATE: { bg: '#dbeafe', color: '#2563eb' },
  DELETE: { bg: '#fee2e2', color: '#dc2626' },
};
```

### 4.2 API — `src/api/logs.ts`

```ts
export const logsApi = {
  async getFiltered(params: { tableName?, operation?, startDate?, endDate?, limit?, offset? }) {
    const filters: string[] = [];
    if (params.tableName) filters.push(`table_name=eq.${params.tableName}`);
    if (params.operation) filters.push(`operation=eq.${params.operation}`);
    if (params.startDate)  filters.push(`created_date=gte.${params.startDate}T00:00:00`);
    if (params.endDate)    filters.push(`created_date=lte.${params.endDate}T23:59:59`);

    const query = filters.length > 0 ? `?${filters.join('&')}` : '';
    const limit  = params.limit  || 50;
    const offset = params.offset || 0;

    const response = await apiClient.get<ILog[]>(
      `/v_audit_logs${query}&order=created_date.desc&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async count(params) {
    /* mesmos filtros */
    const response = await apiClient.get<ILog[]>(`/v_audit_logs${query}&select=id`, {
      headers: { Prefer: 'count=exact' },
    });
    const contentRange = response.headers['content-range'];
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) return parseInt(match[1], 10);
    }
    return response.data?.length || 0;
  },
};
```

Características:

- Lê-se a **view** `v_audit_logs` (e não a tabela), para já receber `user_name`
  e `user_email` resolvidos.
- `count()` usa o header `Prefer: count=exact` do PostgREST e parseia o
  `Content-Range` (`0-49/1234`) para obter o total sem trazer todas as linhas.
- Filtro de intervalo: `gte.<data>T00:00:00` e `lte.<data>T23:59:59`.

### 4.3 Interceptor `snake_case → camelCase` — `src/api/client.ts`

As colunas do Postgres vêm em `snake_case`; o front-end usa `camelCase`. O
interceptor de resposta converte recursivamente (inclusive dentro do JSONB de
`data_old`/`data_new`):

```ts
function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = snakeToCamel(value);
  }
  return result;
}
```

Por isso o snapshot interno aparece com `createdAt`/`updatedAt` — e é por isso
que a interface filtra esses campos ruins (ver §4.5).

O mesmo arquivo anexa o JWT antes de cada requisição, o que popula
`request.jwt.claims` no Postgres:

```ts
const { data: { session } } = await supabase.auth.getSession();
if (session?.access_token) config.headers.Authorization = `Bearer ${session.access_token}`;
```

### 4.4 Store — `src/store/useLogStore.ts`

Zustand, `PAGE_SIZE = 50`.

```ts
fetchLogs: async (filters, page = 1) => {
  const activeFilters = filters || get().filters;
  set({ isLoading: true });
  try {
    const [data, count] = await Promise.all([
      logsApi.getFiltered({ ...activeFilters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
      logsApi.count(activeFilters),
    ]);
    set({
      logs: page === 1 ? data : [...get().logs, ...data],
      total: count,
      currentPage: page,
      hasMore: data.length >= PAGE_SIZE,
      filters: activeFilters,
      isLoading: false,
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    set({ isLoading: false });
  }
}
```

- `getFiltered` e `count` rodam **em paralelo**.
- `page === 1` substitui a lista; páginas seguintes **acrescentam** (`loadMore`).
- `hasMore` é inferido por `data.length >= PAGE_SIZE` (heurística: se veio
  página cheia, provavelmente existe a próxima).

### 4.5 Interface — `src/pages/logs/LogsSearch.tsx`

**Estrutura da página**

- **Cabeçalho:** ícone `History`, título **Auditoria**, subtítulo
  `"{total} registros encontrados"`.
- **Painel de filtros** (colapsável, com contador de filtros ativos):
  - `Tabela` — select com as 9 tabelas auditadas
  - `Operacao` — select com Inserido / Alterado / Excluido
  - `Data Inicio` e `Data Fim` — `<input type="date">`
  - Ações: **Limpar tudo** (só aparece se houver filtro ativo) e **Aplicar**
- **Lista:** cards com data formatada (`toLocaleString('pt-BR')`), badge
  colorido da operação, rótulo da tabela e autor
  (`userName || userEmail || userUuid || 'Sistema'`).
- **Paginação incremental:** botão **Carregar mais**.
- **Estado vazio:** "Nenhum log encontrado" / "Ajuste os filtros para visualizar
  os registros de auditoria".

**Modal de detalhes — `LogDetailModal`**

Metadados no topo (Data, Usuário, Tabela, Operação) e, abaixo, uma tabela
diferente por operação:

| Operação | Seção | Colunas | Origem |
|---|---|---|---|
| `DELETE` | Dados Excluidos | Campo \| Valor | `dataOld` |
| `INSERT` | Dados Inseridos | Campo \| Valor | `dataNew` |
| `UPDATE` | Alteracoes | Campo \| **Antes** \| **Depois** | `dataOld` + `dataNew` |

No caso de `UPDATE`, as linhas efetivamente alteradas recebem destaque visual
(fundo amarelo, `hsla(45,93%,47%,0.06)`). O cálculo do diff:

```ts
const getDiffKeys = (): Set<string> => {
  const diffs = new Set<string>();
  if (!oldFields || !newFields) return diffs;
  const oldMap = new Map(oldFields.map(f => [f.key, f.value]));
  const newMap = new Map(newFields.map(f => [f.key, f.value]));
  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
  allKeys.forEach(key => {
    if (oldMap.get(key) !== newMap.get(key)) diffs.add(key);
  });
  return diffs;
};
```

Campos de metadado removidos da exibição (L32):

```ts
.filter(([key]) => !['id', 'createdAt', 'createdAtDatetime', 'updatedAt', 'updatedAtDatetime'].includes(key))
```

### 4.6 Ponto de entrada — `src/pages/settings/SettingsPage.tsx`

A Auditoria é uma **aba** dentro de Ajustes, não uma rota própria:

```tsx
type Tab = 'overview' | 'profiles' | 'logs';

const tabs = [
  { key: 'overview', label: 'Visão Geral',        icon: Info },
  { key: 'profiles', label: 'Perfis & Permissões', icon: Shield },
  { key: 'logs',     label: 'Auditoria',          icon: History },
];
```

A aba "Visão Geral" também possui um card que leva à mesma aba `logs`:
*"Visualize o histórico de alterações realizadas no sistema."*

---

## 5. Fluxo detalhado de gravação

1. O usuário faz login pelo Supabase Auth (`src/store/useAuthStore.ts`) e recebe
   um `access_token` (JWT).
2. Uma mutação é disparada pelo app. Exemplos reais:
   - `POST /members`, `PATCH /members` — `src/api/members.ts` (L107, L112)
   - `POST/PATCH/DELETE /meetings` — `src/api/meetings.ts` (L67, L72, L77)
   - `POST/PATCH/DELETE /meetings_members` — `src/api/meetings.ts` (L117, L125, L130)
   - `PATCH /users` (vínculo `profile_id`) — `src/api/users.ts` (L48)
   - `POST/PATCH/DELETE /profiles` — `src/api/profiles.ts` (L34, L41, L48)
   - `DELETE` + `POST /permissions` (upsert) — `src/api/profiles.ts` (L74, L88, L98)
3. `apiClient` anexa `Authorization: Bearer <JWT>` e envia a requisição ao
   PostgREST.
4. O Postgres executa a mutação e dispara o `AFTER INSERT/UPDATE/DELETE` da
   tabela afetada.
5. `fn_audit()` roda:
   - extrai `user_uuid` do JWT;
   - resolve `user_id` via `SELECT id FROM users WHERE uuid = ...`;
   - insere uma linha em `audit_logs` com `table_name`, `operation` e os
     snapshots `data_old` / `data_new`.
6. A policy `"audit_logs: sem escrita direta"` não bloqueia esse `INSERT`
   porque a função é `SECURITY DEFINER`.
7. A transação é commitada: **a mutação de negócio e o registro de auditoria
   são atômicos**.

---

## 6. Fluxo detalhado de leitura

1. O super-admin abre **Ajustes → Auditoria** (rota `/settings`, aba `logs`).
2. `LogsSearch` monta e dispara `fetchLogs()` no `useEffect` inicial.
3. `useLogStore` chama `logsApi.getFiltered()` e `logsApi.count()` em paralelo.
4. Duas requisições ao PostgREST:
   - `GET /rest/v1/v_audit_logs?...&order=created_date.desc&limit=50&offset=0`
   - `GET /rest/v1/v_audit_logs?...&select=id` com `Prefer: count=exact`
5. O interceptor converte `snake_case → camelCase` na resposta.
6. A view `v_audit_logs` já devolve `user_name` e `user_email` (via join).
7. A UI renderiza os cards. Clicar em um card abre o `LogDetailModal`, que
   monta a tabela Antes/Depois e destaca as linhas alteradas.
8. **Carregar mais** busca a próxima página (`offset = página × 50`) e
   acrescenta ao final da lista.

---

## 7. Permissões e controle de acesso

| Camada | Regra | Arquivo |
|---|---|---|
| Guarda de rota | `SuperAdminRoute` redireciona para `/` se `!user.isAdminSuper` | `src/App.tsx` (L43–58, L120) |
| Menu | Item "Ajustes" só renderizado se `user.isAdminSuper` | `src/components/layout/Header.tsx` (L101–106) |
| RLS (tabela) | `SELECT` em `audit_logs` apenas com `users.is_admin_super = TRUE` | `dev/sql/audit_triggers.sql` (L155–164) |
| RLS (escrita) | `FOR ALL ... USING (FALSE)` — nenhuma escrita direta | `dev/sql/audit_triggers.sql` (L168–172) |
| Matriz de perfis | Módulos `members`, `meetings`, `reports`, `settings` com `can_view/create/edit/delete/export` | `dev/sql/profiles_permissions.sql` |

Observações:

- **Não existe um módulo `audit`/`logs` na matriz de permissões.** O acesso à
  auditoria é fixo em super-admin, não configurável por perfil.
- `isAdminSuper` dá bypass total no `usePermissionStore`; demais perfis são
  negados por padrão.
- Perfis semeados: `Administrador`, `Secretário`, `Coordenador`, `Membro`,
  `Visitante` (inativo) — **nenhum** deles acessa a Auditoria.

---

## 8. Referência de arquivos

### Banco de dados

| Arquivo | Linhas | Papel |
|---|---|---|
| `dev/sql/audit_triggers.sql` | 199 | Motor completo: tabela, função, 9 triggers, RLS, view |
| `dev/sql/profiles_permissions.sql` | 209 | `profiles` + `permissions` (ambas auditadas) |
| `dev/sql/add_profile_id_to_users.sql` | 14 | FK `users.profile_id` (ambas auditadas) |

### Front-end

| Arquivo | Linhas | Papel |
|---|---|---|
| `src/api/logs.ts` | 78 | `logsApi` — chamadas PostgREST a `v_audit_logs` |
| `src/api/client.ts` | 59 | Interceptors: JWT + `snake_case → camelCase` |
| `src/api/index.ts` | 9 | `export { logsApi } from './logs';` |
| `src/models/log.ts` | 52 | `ILog`, `ILogFilters`, `TABLE_LABELS`, `OPERATION_LABELS`, `OPERATION_COLORS` |
| `src/models/index.ts` | 10 | `export * from './log';` |
| `src/store/useLogStore.ts` | 73 | Store Zustand: fetch / paginação / filtros |
| `src/pages/logs/LogsSearch.tsx` | 607 | Tela "Auditoria": filtros, lista, modal de diff |
| `src/pages/settings/SettingsPage.tsx` | 163 | Aba "Auditoria" dentro de Ajustes |
| `src/App.tsx` | 129 | Guarda `SuperAdminRoute` em `/settings` |
| `src/components/layout/Header.tsx` | L101–106 | Link "Ajustes" condicional |

### Histórico Git

A funcionalidade foi introduzida em 4 commits (autor: Eduardo Mattos, 2026-08-31):

```
a9850f6  Member Edit & Audit Logs        # feature: audit_triggers.sql + LogsSearch + store + api
02036db  Member Edit & Audit Logs 1      # renomeou tabela logs -> audit_logs, view v_logs -> v_audit_logs
a385020  Member Edit & Audit Logs 2      # created_date: 'utc' -> 'America/Sao_Paulo'
510db63  Member Edit & Audit Logs 3      # ajustes na edição de membros
```

---

## 9. Deploy e manutenção

Não há runner de migrações. Todo o schema é aplicado **manualmente** pelo
**SQL Editor do Supabase**.

### Procedimento

1. Abrir o Supabase Dashboard → **SQL Editor** → **New query**.
2. Colar o conteúdo de `dev/sql/audit_triggers.sql`.
3. Executar. O script é idempotente — pode ser reaplicado sem limpar nada.
4. Validar:

```sql
-- triggers ativos
SELECT tgname, relname
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE tgname LIKE 'audit_%' AND NOT tgisinternal;

-- registros recentes
SELECT id, created_date, table_name, operation, user_uuid
FROM public.audit_logs
ORDER BY created_date DESC
LIMIT 20;

-- total por tabela
SELECT table_name, operation, count(*)
FROM public.audit_logs
GROUP BY table_name, operation
ORDER BY table_name, operation;
```

### Checklist de manutenção

- [ ] Ao criar uma nova tabela de negócio, adicionar o `CREATE TRIGGER audit_<tabela>` correspondente.
- [ ] Ao renomear uma tabela, atualizar `TABLE_LABELS` em `src/models/log.ts`.
- [ ] Ao adicionar uma nova operação (ex.: `TRUNCATE`), revisar `fn_audit()`.
- [ ] Reprovar o script após qualquer mudança no schema de `audit_logs`.
- [ ] Monitorar o crescimento da tabela (sem particionamento nem política de retenção no momento).

---

## 10. Riscos, limitações e recomendações

### R1 — RLS contornada pela view (severidade: **alta**)

`CREATE OR REPLACE VIEW public.v_audit_logs` foi criada **sem**
`WITH (security_invoker = true)`. Em PostgreSQL 15, uma view sem essa opção
executa com os privilégios do dono (`postgres`, que possui `BYPASSRLS`), de modo
que a policy `"audit_logs: leitura apenas super admin"` **não é aplicada** ao
ler pela view.

Consequência: qualquer usuário autenticado pode chamar
`GET /rest/v1/v_audit_logs` diretamente com o próprio JWT e ler a trilha
completa — incluindo CPF, endereço, data de nascimento e `is_admin_super` de
outros usuários. A proteção atual da interface é apenas **cosmética**.

**Correção:**

```sql
CREATE OR REPLACE VIEW public.v_audit_logs
WITH (security_invoker = true) AS
SELECT
  l.id, l.created_date, l.user_uuid,
  u.name_full AS user_name,
  u.email     AS user_email,
  l.table_name, l.operation, l.data_old, l.data_new, l.user_id
FROM public.audit_logs l
LEFT JOIN public.users u ON u.uuid = l.user_uuid::TEXT;
```

### R2 — PII completa em JSONB, sem retenção (severidade: **alta**)

`data_old`/`data_new` guardam a **linha inteira**. Excluir um sócio deixa CPF,
data de nascimento e endereço permanentemente no histórico. Não existe
redação por coluna nem job de purga/anonimização.

**Recomendações:** snapshot por allowlist de colunas por tabela; ou política de
retenção (ex.: anonimizar `data_old`/`data_new` após N meses); ou gravação em
bucket com expiração.

### R3 — Inconsistência de fuso horário (severidade: média)

O comentário na coluna diz `'(UTC)'` (L29), mas o default é
`NOW() AT TIME ZONE 'America/Sao_Paulo'` sobre um `TIMESTAMP WITHOUT TIME ZONE`
— ou seja, hora local "crua", sem informação de zona. A interface renderiza
com `new Date(createdDate)`, que o navegador interpreta no fuso **local da
máquina do cliente**. Usuários em fusos diferentes veem horários deslocados.

**Correção:** usar `TIMESTAMPTZ` com `NOW()`, ou manter o `TIMESTAMP` mas
formatar a data sem conversão de timezone.

### R4 — Soft delete aparece como UPDATE (severidade: média)

`membersApi.softDelete` executa `PATCH { is_deleted: true }`. O log é gravado
como `UPDATE`, nunca como `DELETE` — o que torna o filtro "Excluído"
enganoso, pois registros de exclusão lógica não aparecem nele.

### R5 — Cobertura parcial das tabelas (severidade: média)

`cities` (consultada em `/cities` e `/v_cities`) e `members_statuses_reasons`
**não** possuem trigger. Alterações nessas tabelas não deixam rastro.

### R6 — Sem exportação de auditoria (severidade: baixa)

A tela de Auditoria é a única sem exportação PDF/Excel, embora o modelo de
permissões possua `can_export` e exista `src/utils/exportUtils.ts` para os
demais módulos.

### R7 — Código morto (severidade: baixa)

- `ILogFilters.userSearch` e `EMPTY_LOG_FILTERS.userSearch` nunca são usados —
  **não existe filtro por usuário** na interface nem na API.
- `useLogStore.setFilters` / `clearFilters` não são chamados pela página
  (que usa estado local + `fetchLogs`).

### R8 — Escala e integridade da tabela (severidade: baixa)

Sem particionamento, sem política de retenção e com 5 índices: a tabela cresce
sem limite. `TRUNCATE` não é bloqueado por RLS.

### R9 — Deploy manual sem rollback (severidade: baixa)

Os scripts de `dev/sql/` são colados manualmente, sem CI, sem versionamento de
migrações e sem caminho de rollback.

---

## 11. Glossário

| Termo | Significado |
|---|---|
| **`audit_logs`** | Tabela que armazena a trilha de auditoria. |
| **`v_audit_logs`** | View que junta `audit_logs` com `users` para exibir nome/e-mail do autor. |
| **`fn_audit()`** | Função PL/pgSQL `SECURITY DEFINER` que grava o log a partir do trigger. |
| **`data_old` / `data_new`** | Snapshots JSONB da linha antes/depois da operação. |
| **`TG_OP` / `TG_TABLE_NAME`** | Variáveis de trigger do PostgreSQL com a operação e a tabela afetada. |
| **`request.jwt.claims`** | Configuração de sessão do PostgREST com o payload do JWT do usuário autenticado. |
| **`SECURITY DEFINER`** | Atributo de função que a executa com os privilégios do dono, ignorando RLS do chamador. |
| **`security_invoker`** | Opção de view (PG ≥ 15) que faz a view respeitar as policies da tabela base. |
| **`RLS`** | Row Level Security — segurança em nível de linha do PostgreSQL. |
| **`is_admin_super`** | Flag em `public.users` que habilita o super-admin (e o acesso à Auditoria). |
| **PostgREST** | Camada de API REST automática do Supabase sobre o PostgreSQL. |
| **Diff** | Comparação campo a campo entre `data_old` e `data_new` feita na interface. |
