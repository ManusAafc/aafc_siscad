import apiClient from './client';
import type { IUser } from '../models/user';

export type { IUser };

export const usersApi = {
  /**
   * Busca o perfil do usuário logado na tabela de usuários do sistema
   * a partir do email cadastrado no Supabase Auth.
   */
  async getByEmail(email: string) {
    const response = await apiClient.get(
      `/users?email=eq.${encodeURIComponent(email)}&select=*&limit=1`
    );
    return response.data?.[0] || null;
  },

  /**
   * Busca usuários vinculados a um perfil com paginação
   */
  async getByProfile(profileId: number, page = 0, limit = 50): Promise<IUser[]> {
    const response = await apiClient.get(
      `/users?profile_id=eq.${profileId}&select=*&order=name_full.asc&limit=${limit}&offset=${page * limit}`
    );
    return response.data || [];
  },

  /**
   * Busca usuários NÃO vinculados a um perfil (para seleção de vínculo)
   */
  async getAvailableForProfile(profileId: number, search = ''): Promise<IUser[]> {
    const params = new URLSearchParams({
      profile_id: 'is.null',
      select: '*',
      order: 'name_full.asc',
    });
    if (search) {
      params.append('or', `(name_full.ilike.*${search}*,email.ilike.*${search}*)`);
    }
    const response = await apiClient.get('/users', { params });
    return response.data || [];
  },

  /**
   * Atualiza o profile_id de um usuário (vincula/desvincula)
   */
  async updateProfile(userId: string, profileId: number | null): Promise<IUser> {
    const response = await apiClient.patch(
      `/users?id=eq.${userId}`,
      { profile_id: profileId },
      { headers: { Prefer: 'return=representation' } }
    );
    return response.data?.[0] || response.data;
  },
};
