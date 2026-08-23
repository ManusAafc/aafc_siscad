import apiClient from './client';

export interface IProfile {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface IPermission {
  id?: number;
  profile_id: number;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export?: boolean;
}

export const profilesApi = {
  async getAll(): Promise<IProfile[]> {
    const response = await apiClient.get('/profiles?select=*&order=name.asc');
    return response.data || [];
  },

  async getById(id: number): Promise<IProfile | null> {
    const response = await apiClient.get(`/profiles?id=eq.${id}&select=*`);
    return response.data?.[0] || null;
  },

  async create(profile: Omit<IProfile, 'id'>): Promise<IProfile> {
    const response = await apiClient.post('/profiles', profile, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data?.[0] || response.data;
  },

  async update(id: number, profile: Partial<IProfile>): Promise<IProfile> {
    const response = await apiClient.patch(`/profiles?id=eq.${id}`, profile, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data?.[0] || response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/profiles?id=eq.${id}`);
  },
};

export const permissionsApi = {
  async getByProfile(profileId: number): Promise<IPermission[]> {
    const response = await apiClient.get(
      `/permissions?profile_id=eq.${profileId}&select=*&order=module.asc`
    );
    const data = response.data || [];
    // Converter camelCase (vindo do interceptor) para snake_case (interface)
    return data.map((p: any) => ({
      id: p.id,
      profile_id: p.profileId,
      module: p.module,
      can_view: p.canView,
      can_create: p.canCreate,
      can_edit: p.canEdit,
      can_delete: p.canDelete,
      can_export: p.canExport,
    }));
  },

  async upsert(permissions: IPermission[]): Promise<IPermission[]> {
    if (permissions.length === 0) return [];
    const profileId = permissions[0].profile_id;
    await apiClient.delete(`/permissions?profile_id=eq.${profileId}`);
    const clean = permissions.map((p) => {
      const obj = {
        profile_id: Number(p.profile_id),
        module: String(p.module),
        can_view: Boolean(p.can_view),
        can_create: Boolean(p.can_create),
        can_edit: Boolean(p.can_edit),
        can_delete: Boolean(p.can_delete),
        can_export: Boolean(p.can_export ?? false),
      };
      return obj;
    });
    try {
      const response = await apiClient.post('/permissions', clean, {
        headers: { Prefer: 'return=representation' },
      });
      return response.data || [];
    } catch (error: any) {
      throw error;
    }
  },

  async deleteByProfile(profileId: number): Promise<void> {
    await apiClient.delete(`/permissions?profile_id=eq.${profileId}`);
  },
};
