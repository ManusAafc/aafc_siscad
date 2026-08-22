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
    return response.data || [];
  },

  async upsert(permissions: IPermission[]): Promise<IPermission[]> {
    const response = await apiClient.post('/permissions', permissions, {
      headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
    });
    return response.data || [];
  },

  async deleteByProfile(profileId: number): Promise<void> {
    await apiClient.delete(`/permissions?profile_id=eq.${profileId}`);
  },
};
