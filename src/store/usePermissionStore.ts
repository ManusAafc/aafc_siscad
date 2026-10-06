import { useEffect } from 'react';
import { create } from 'zustand';
import { IPermission, permissionsApi } from '../api/profiles';
import { useAuthStore } from './useAuthStore';

export type PermissionAction = 'can_view' | 'can_create' | 'can_edit' | 'can_delete' | 'can_export';

interface PermissionState {
  profileId: number | null;
  permissions: IPermission[];
  isLoading: boolean;
  load: (profileId: number | null) => Promise<void>;
  reset: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  profileId: null,
  permissions: [],
  isLoading: false,

  load: async (profileId) => {
    const state = get();

    if (state.profileId === profileId && (profileId === null || !state.isLoading)) {
      if (profileId === null || state.permissions.length > 0) return;
    }

    if (profileId === null) {
      set({ profileId: null, permissions: [], isLoading: false });
      return;
    }

    set({ profileId, isLoading: true });
    try {
      const rows = await permissionsApi.getByProfile(profileId);
      set({ permissions: rows || [], isLoading: false });
    } catch (error) {
      console.warn('[usePermissionStore] Falha ao carregar permissões:', error);
      set({ permissions: [], isLoading: false });
    }
  },

  reset: () => set({ profileId: null, permissions: [], isLoading: false }),
}));

/**
 * Regras:
 * - isAdminSuper tem liberação total (bypass).
 * - Demais usuários seguem a linha de `permissions` do seu profile/módulo.
 * - Sem profile ou sem linha cadastrada => negado (deny-by-default).
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const permissions = usePermissionStore((state) => state.permissions);
  const isLoading = usePermissionStore((state) => state.isLoading);
  const load = usePermissionStore((state) => state.load);

  const profileId = user.profile_id ?? null;

  useEffect(() => {
    load(profileId);
  }, [profileId, load]);

  const can = (module: string, action: PermissionAction): boolean => {
    if (user.isAdminSuper) return true;
    const row = permissions.find((permission) => permission.module === module);
    if (!row) return false;
    return row[action] === true;
  };

  return {
    canView: (module: string) => can(module, 'can_view'),
    canCreate: (module: string) => can(module, 'can_create'),
    canEdit: (module: string) => can(module, 'can_edit'),
    canDelete: (module: string) => can(module, 'can_delete'),
    canExport: (module: string) => can(module, 'can_export'),
    isLoading,
  };
};
