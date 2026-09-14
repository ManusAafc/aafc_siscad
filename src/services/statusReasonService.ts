import apiClient from '../api/client';
import { IStatusReason } from '../models';

export const statusReasonService = {
  async getAllStatusReasons(): Promise<IStatusReason[]> {
    try {
      const response = await apiClient.get('/members_statuses_reasons?select=*&order=id.asc');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar motivos de desligamento:', error);
      return [];
    }
  },
};
