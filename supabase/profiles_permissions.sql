-- ══════════════════════════════════════════════════════════════════════════════
-- SISCAD AAFC — Script de criação das tabelas profiles e permissions
-- Execute no SQL Editor do Supabase na ordem em que está escrito
-- ══════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FUNÇÃO AUXILIAR: atualiza updated_at automaticamente
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABELA: profiles (Perfis de acesso)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles (name);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.profiles             IS 'Perfis de acesso ao sistema';
COMMENT ON COLUMN public.profiles.name        IS 'Nome do perfil (ex: Administrador, Secretário)';
COMMENT ON COLUMN public.profiles.description IS 'Descrição detalhada do perfil';
COMMENT ON COLUMN public.profiles.is_active   IS 'Indica se o perfil está ativo';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABELA: permissions (Permissões por módulo)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.permissions (
  id          SERIAL PRIMARY KEY,
  profile_id  INTEGER NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module      VARCHAR(50) NOT NULL,
  can_view    BOOLEAN NOT NULL DEFAULT FALSE,
  can_create  BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit    BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete  BOOLEAN NOT NULL DEFAULT FALSE,
  can_export  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, module)
);

CREATE INDEX IF NOT EXISTS idx_permissions_profile_id ON public.permissions (profile_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module     ON public.permissions (module);

DROP TRIGGER IF EXISTS trg_permissions_updated_at ON public.permissions;
CREATE TRIGGER trg_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.permissions             IS 'Permissões de cada perfil por módulo';
COMMENT ON COLUMN public.permissions.profile_id  IS 'FK para public.profiles';
COMMENT ON COLUMN public.permissions.module      IS 'Módulo: members | meetings | reports | settings';
COMMENT ON COLUMN public.permissions.can_view    IS 'Pode visualizar registros';
COMMENT ON COLUMN public.permissions.can_create  IS 'Pode criar novos registros';
COMMENT ON COLUMN public.permissions.can_edit    IS 'Pode editar registros existentes';
COMMENT ON COLUMN public.permissions.can_delete  IS 'Pode excluir registros';
COMMENT ON COLUMN public.permissions.can_export  IS 'Pode exportar (PDF/Excel)';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- profiles: leitura para qualquer usuário autenticado
DROP POLICY IF EXISTS "profiles: leitura para autenticados" ON public.profiles;
CREATE POLICY "profiles: leitura para autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- profiles: escrita apenas super admin
DROP POLICY IF EXISTS "profiles: escrita apenas super admin" ON public.profiles;
CREATE POLICY "profiles: escrita apenas super admin"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.email = auth.jwt() ->> 'email'
        AND u.is_admin_super = TRUE
    )
  );

-- permissions: leitura para qualquer usuário autenticado
DROP POLICY IF EXISTS "permissions: leitura para autenticados" ON public.permissions;
CREATE POLICY "permissions: leitura para autenticados"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (TRUE);

-- permissions: escrita apenas super admin
DROP POLICY IF EXISTS "permissions: escrita apenas super admin" ON public.permissions;
CREATE POLICY "permissions: escrita apenas super admin"
  ON public.permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.email = auth.jwt() ->> 'email'
        AND u.is_admin_super = TRUE
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SEED: Perfis padrão
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.profiles (name, description, is_active) VALUES
  ('Administrador', 'Acesso total ao sistema',                         TRUE),
  ('Secretário',    'Gerencia membros e reuniões',                     TRUE),
  ('Coordenador',   'Visualiza e edita membros da sua região',         TRUE),
  ('Membro',        'Acesso somente leitura ao próprio perfil',        TRUE),
  ('Visitante',     'Acesso mínimo — apenas visualização de reuniões', FALSE)
ON CONFLICT DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED: Permissões — Administrador (acesso total)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE v_id INTEGER;
BEGIN
  SELECT id INTO v_id FROM public.profiles WHERE name = 'Administrador' LIMIT 1;
  INSERT INTO public.permissions (profile_id, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
    (v_id, 'members',  TRUE, TRUE, TRUE, TRUE, TRUE),
    (v_id, 'meetings', TRUE, TRUE, TRUE, TRUE, TRUE),
    (v_id, 'reports',  TRUE, TRUE, TRUE, TRUE, TRUE),
    (v_id, 'settings', TRUE, TRUE, TRUE, TRUE, FALSE)
  ON CONFLICT (profile_id, module) DO NOTHING;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SEED: Permissões — Secretário
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE v_id INTEGER;
BEGIN
  SELECT id INTO v_id FROM public.profiles WHERE name = 'Secretário' LIMIT 1;
  INSERT INTO public.permissions (profile_id, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
    (v_id, 'members',  TRUE, TRUE,  TRUE,  FALSE, TRUE),
    (v_id, 'meetings', TRUE, TRUE,  TRUE,  FALSE, TRUE),
    (v_id, 'reports',  TRUE, FALSE, FALSE, FALSE, TRUE),
    (v_id, 'settings', FALSE, FALSE, FALSE, FALSE, FALSE)
  ON CONFLICT (profile_id, module) DO NOTHING;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. SEED: Permissões — Coordenador
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE v_id INTEGER;
BEGIN
  SELECT id INTO v_id FROM public.profiles WHERE name = 'Coordenador' LIMIT 1;
  INSERT INTO public.permissions (profile_id, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
    (v_id, 'members',  TRUE, FALSE, TRUE,  FALSE, FALSE),
    (v_id, 'meetings', TRUE, FALSE, FALSE, FALSE, FALSE),
    (v_id, 'reports',  TRUE, FALSE, FALSE, FALSE, FALSE),
    (v_id, 'settings', FALSE, FALSE, FALSE, FALSE, FALSE)
  ON CONFLICT (profile_id, module) DO NOTHING;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. VIEW: v_profiles_permissions (opcional — facilita consultas)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_profiles_permissions AS
SELECT
  p.id            AS profile_id,
  p.name          AS profile_name,
  p.is_active,
  pm.module,
  pm.can_view,
  pm.can_create,
  pm.can_edit,
  pm.can_delete,
  pm.can_export
FROM public.profiles  p
LEFT JOIN public.permissions pm ON pm.profile_id = p.id
ORDER BY p.name, pm.module;

-- ══════════════════════════════════════════════════════════════════════════════
-- FIM DO SCRIPT
-- ══════════════════════════════════════════════════════════════════════════════
