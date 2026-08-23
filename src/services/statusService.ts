import apiClient from '../api/client';
import { IMemberStatus } from '../models';

export const statusService = {
  async getAllStatuses(): Promise<IMemberStatus[]> {
    try {
      const response = await apiClient.get('/v_members_statuses?select=*&order=id.asc');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      return [];
    }
  },
};
