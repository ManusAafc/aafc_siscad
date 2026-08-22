import apiClient from './client';

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
};
