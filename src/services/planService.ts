import apiClient from '../api/client';
import { IPlan } from '../models';

export const planService = {
  async getAllPlans(): Promise<IPlan[]> {
    try {
      const response = await apiClient.get('/plans?select=*&order=description.asc');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  },

  async getPlanById(id: number): Promise<IPlan | null> {
    try {
      const response = await apiClient.get(`/plans?id=eq.${id}&select=*`);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      return null;
    }
  },
};
