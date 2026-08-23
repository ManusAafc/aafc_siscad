-- ══════════════════════════════════════════════════════════════════════════════
-- SISCAD AAFC — Adiciona profile_id na tabela users
-- Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════════════════════

-- Adiciona coluna profile_id (nullable para não quebrar dados existentes)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_id INTEGER REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_profile_id ON public.users (profile_id);

COMMENT ON COLUMN public.users.profile_id IS 'FK para public.profiles — perfil de acesso do usuário';

-- ══════════════════════════════════════════════════════════════════════════════
